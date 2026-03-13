using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineCoursePlatform.API.Application.DTOs.Content;
using OnlineCoursePlatform.API.Application.Services;
using System.Security.Claims;

namespace OnlineCoursePlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
    private readonly ICommunityContentService _communityContentService;
    private readonly IWebHostEnvironment _environment;

    public ResourcesController(ICommunityContentService communityContentService, IWebHostEnvironment environment)
    {
        _communityContentService = communityContentService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetResources([FromQuery] string? courseId, [FromQuery] string? instructorId, [FromQuery] int? limit)
    {
        var resources = await _communityContentService.GetResourcesAsync(courseId, instructorId, limit);
        return Ok(resources);
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpPost]
    [RequestSizeLimit(25_000_000)]
    public async Task<IActionResult> CreateResource([FromForm] CreateResourceDto dto, IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst("name")?.Value ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Instructor";

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest(new { Message = "Vui lòng chọn file để tải lên." });

        var uploadsRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "resources");
        Directory.CreateDirectory(uploadsRoot);

        var safeName = SanitizeFileName(Path.GetFileNameWithoutExtension(file.FileName));
        var extension = Path.GetExtension(file.FileName);
        var storedName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}_{safeName}{extension}";
        var physicalPath = Path.Combine(uploadsRoot, storedName);

        await using (var stream = new FileStream(physicalPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        try
        {
            var created = await _communityContentService.CreateResourceAsync(dto, new StoredFileDetails
            {
                FileName = file.FileName,
                FileUrl = $"/uploads/resources/{storedName}",
                FileExtension = extension,
                FileSize = file.Length
            }, userId, userName, role);

            return Ok(created);
        }
        catch (UnauthorizedAccessException ex)
        {
            System.IO.File.Delete(physicalPath);
            return StatusCode(403, new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            System.IO.File.Delete(physicalPath);
            return StatusCode(403, new { Message = ex.Message });
        }
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteResource(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Instructor";
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var result = await _communityContentService.DeleteResourceAsync(id, userId, role);
        if (!result.Deleted)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(result.FileUrl))
        {
            var relativePath = result.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var physicalPath = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath);
            if (System.IO.File.Exists(physicalPath))
                System.IO.File.Delete(physicalPath);
        }

        return NoContent();
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var cleaned = new string(fileName.Select(ch => invalidChars.Contains(ch) ? '-' : ch).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? "tai-lieu" : cleaned;
    }
}


