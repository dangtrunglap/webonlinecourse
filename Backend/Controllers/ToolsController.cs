using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineCoursePlatform.API.Application.DTOs.Content;
using OnlineCoursePlatform.API.Application.Services;
using System.Security.Claims;

namespace OnlineCoursePlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToolsController : ControllerBase
{
    private static readonly string[] AllowedExtensions = [".exe", ".rar", ".zip"];

    private readonly ICommunityContentService _communityContentService;
    private readonly IWebHostEnvironment _environment;

    public ToolsController(ICommunityContentService communityContentService, IWebHostEnvironment environment)
    {
        _communityContentService = communityContentService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetTools([FromQuery] int? limit, [FromQuery] string? uploadedById)
    {
        var releases = await _communityContentService.GetToolReleasesAsync(limit, uploadedById);
        return Ok(releases);
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpPost]
    [RequestSizeLimit(250_000_000)]
    public async Task<IActionResult> CreateTool([FromForm] CreateToolReleaseDto dto, IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst("name")?.Value ?? "Unknown";

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest(new { Message = "Vui lòng chọn file .exe, .rar hoặc .zip để tải lên." });

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { Message = "Chỉ hỗ trợ file .exe, .rar hoặc .zip cho mục Công cụ." });

        var uploadsRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "tools");
        Directory.CreateDirectory(uploadsRoot);

        var safeName = SanitizeFileName(Path.GetFileNameWithoutExtension(file.FileName));
        var storedName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}_{safeName}{extension}";
        var physicalPath = Path.Combine(uploadsRoot, storedName);

        await using (var stream = new FileStream(physicalPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        try
        {
            var created = await _communityContentService.CreateToolReleaseAsync(dto, new StoredFileDetails
            {
                FileName = file.FileName,
                FileUrl = $"/uploads/tools/{storedName}",
                FileExtension = extension,
                FileSize = file.Length
            }, userId, userName);

            foreach (var oldFileUrl in created.ReplacedFileUrls)
            {
                DeleteUploadByUrl(oldFileUrl);
            }

            return Ok(created.Release);
        }
        catch (InvalidOperationException ex)
        {
            System.IO.File.Delete(physicalPath);
            return BadRequest(new { Message = ex.Message });
        }
    }

    [Authorize(Policy = "RequireInstructor")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTool(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Instructor";
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var result = await _communityContentService.DeleteToolReleaseAsync(id, userId, role);
        if (!result.Deleted)
            return NotFound();

        DeleteUploadByUrl(result.FileUrl);

        return NoContent();
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var cleaned = new string(fileName.Select(ch => invalidChars.Contains(ch) ? '-' : ch).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? "cong-cu" : cleaned;
    }

    private void DeleteUploadByUrl(string? fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return;

        var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var physicalPath = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath);
        if (System.IO.File.Exists(physicalPath))
            System.IO.File.Delete(physicalPath);
    }
}
