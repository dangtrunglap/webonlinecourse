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
    private readonly ICommunityContentService _communityContentService;

    public BlogPostsController(ICommunityContentService communityContentService)
    {
        _communityContentService = communityContentService;
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
    public async Task<IActionResult> CreateBlogPost([FromBody] CreateBlogPostDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst("name")?.Value ?? "Unknown";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Instructor";

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        try
        {
            var created = await _communityContentService.CreateBlogPostAsync(dto, userId, userName, role);
            return CreatedAtAction(nameof(GetBlogPost), new { id = created.Id }, created);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { Message = ex.Message });
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

        var deleted = await _communityContentService.DeleteBlogPostAsync(id, userId, role);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}


