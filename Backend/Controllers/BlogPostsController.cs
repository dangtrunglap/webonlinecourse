using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineCoursePlatform.API.Application.DTOs.Content;
using OnlineCoursePlatform.API.Application.Services;
using System.Security.Claims;

namespace OnlineCoursePlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogPostsController : ControllerBase
{
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    private readonly ICommunityContentService _communityContentService;
    private readonly IWebHostEnvironment _environment;

    public BlogPostsController(ICommunityContentService communityContentService, IWebHostEnvironment environment)
    {
        _communityContentService = communityContentService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetBlogPosts([FromQuery] string? courseId, [FromQuery] string? instructorId, [FromQuery] int? limit)
    {
        var posts = await _communityContentService.GetBlogPostsAsync(courseId, instructorId, limit);
        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBlogPost(string id)
    {
        var post = await _communityContentService.GetBlogPostByIdAsync(id);
        if (post == null)
            return NotFound();

        return Ok(post);
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpPost]
    [RequestSizeLimit(15_000_000)]
    public async Task<IActionResult> CreateBlogPost([FromForm] CreateBlogPostDto dto, IFormFile? coverImage)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst("name")?.Value ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Instructor";

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        string? savedCoverImageUrl = null;
        string? savedPhysicalPath = null;

        try
        {
            if (coverImage != null)
            {
                var storedFile = await SaveImageAsync(coverImage, "blog-covers", "blog-cover");
                savedCoverImageUrl = storedFile.FileUrl;
                savedPhysicalPath = storedFile.PhysicalPath;
            }

            var created = await _communityContentService.CreateBlogPostAsync(dto, userId, userName, role, savedCoverImageUrl);
            return CreatedAtAction(nameof(GetBlogPost), new { id = created.Id }, created);
        }
        catch (UnauthorizedAccessException ex)
        {
            DeletePhysicalFile(savedPhysicalPath);
            return StatusCode(403, new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            DeletePhysicalFile(savedPhysicalPath);
            return BadRequest(new { Message = ex.Message });
        }
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpPut("{id}")]
    [HttpPost("{id}/update")]
    [RequestSizeLimit(15_000_000)]
    public async Task<IActionResult> UpdateBlogPost(string id, [FromForm] CreateBlogPostDto dto, IFormFile? coverImage)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst("name")?.Value ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Instructor";

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        string? savedCoverImageUrl = null;
        string? savedPhysicalPath = null;

        try
        {
            if (coverImage != null)
            {
                var storedFile = await SaveImageAsync(coverImage, "blog-covers", "blog-cover");
                savedCoverImageUrl = storedFile.FileUrl;
                savedPhysicalPath = storedFile.PhysicalPath;
            }

            var updated = await _communityContentService.UpdateBlogPostAsync(id, dto, userId, userName, role, savedCoverImageUrl);
            if (updated == null)
            {
                DeletePhysicalFile(savedPhysicalPath);
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(savedCoverImageUrl) || dto.RemoveCoverImage)
                DeleteUploadByUrl(updated.PreviousCoverImageUrl);

            return Ok(updated.Post);
        }
        catch (UnauthorizedAccessException ex)
        {
            DeletePhysicalFile(savedPhysicalPath);
            return StatusCode(403, new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            DeletePhysicalFile(savedPhysicalPath);
            return BadRequest(new { Message = ex.Message });
        }
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpPost("images")]
    [RequestSizeLimit(15_000_000)]
    public async Task<IActionResult> UploadInlineImage(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        try
        {
            var storedFile = await SaveImageAsync(file, "blog-inline", "blog-image");
            return Ok(new { url = storedFile.FileUrl });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBlogPost(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Instructor";
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var result = await _communityContentService.DeleteBlogPostAsync(id, userId, role);
        if (!result.Deleted)
            return NotFound();

        DeleteUploadByUrl(result.FileUrl);
        return NoContent();
    }

    private async Task<StoredUploadFile> SaveImageAsync(IFormFile file, string folderName, string fallbackName)
    {
        if (file == null || file.Length == 0)
            throw new InvalidOperationException("Vui lòng chọn ảnh để tải lên.");

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedImageExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("Ảnh blog chỉ hỗ trợ định dạng .jpg, .jpeg, .png hoặc .webp.");

        var uploadsRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", folderName);
        Directory.CreateDirectory(uploadsRoot);

        var safeName = SanitizeFileName(Path.GetFileNameWithoutExtension(file.FileName), fallbackName);
        var storedName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}_{safeName}{extension}";
        var physicalPath = Path.Combine(uploadsRoot, storedName);

        await using (var stream = new FileStream(physicalPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return new StoredUploadFile($"/uploads/{folderName}/{storedName}", physicalPath);
    }

    private void DeleteUploadByUrl(string? fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return;

        var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var physicalPath = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath);
        DeletePhysicalFile(physicalPath);
    }

    private static void DeletePhysicalFile(string? physicalPath)
    {
        if (!string.IsNullOrWhiteSpace(physicalPath) && System.IO.File.Exists(physicalPath))
            System.IO.File.Delete(physicalPath);
    }

    private static string SanitizeFileName(string fileName, string fallbackName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var cleaned = new string(fileName.Select(ch => invalidChars.Contains(ch) ? '-' : ch).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? fallbackName : cleaned;
    }

    private sealed record StoredUploadFile(string FileUrl, string PhysicalPath);
}


