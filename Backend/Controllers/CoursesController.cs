using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineCoursePlatform.API.Application.DTOs.Course;
using OnlineCoursePlatform.API.Application.Services;
using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineCoursePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env;

        public CoursesController(ICourseService courseService, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
            _courseService = courseService;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetCourses([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var (courses, totalCount) = await _courseService.GetCoursesAsync(search, page, pageSize);
            return Ok(new { Items = courses, TotalCount = totalCount, Page = page, PageSize = pageSize });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(Guid id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);
            if (course == null) return NotFound();
            return Ok(course);
        }

        [Authorize(Policy = "RequireInstructor")]
        [HttpPost]
        public async Task<IActionResult> CreateCourse(CreateCourseDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User.FindFirst("name")?.Value ?? "Unknown";

            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            var course = await _courseService.CreateCourseAsync(dto, userId, userName);
            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }

        [Authorize(Policy = "RequireInstructor")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Guid.TryParse(userIdStr, out var userId) || userRole == null) return Unauthorized();

            var success = await _courseService.DeleteCourseAsync(id, userId, userRole);
            if (!success) return Forbid();

            return NoContent();
        }

        [Authorize(Policy = "RequireInstructor")]
        [HttpPost("{id}/thumbnail")]
        public async Task<IActionResult> UploadThumbnail(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Guid.TryParse(userIdStr, out var userId) || userRole == null) return Unauthorized();

            // Needs static files
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "thumbnails");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/thumbnails/{fileName}";

            var result = await _courseService.UpdateThumbnailAsync(id, relativePath, userId, userRole);
            if (result == null) return Forbid();

            return Ok(new { ThumbnailUrl = result });
        }
    }
}
