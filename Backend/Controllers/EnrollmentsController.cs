using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineCoursePlatform.API.Application.Services;
using System.Security.Claims;

namespace OnlineCoursePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IEnrollmentService _enrollmentService;

        public EnrollmentsController(IEnrollmentService enrollmentService)
        {
            _enrollmentService = enrollmentService;
        }

        [HttpPost("{courseId}/enroll")]
        public async Task<IActionResult> EnrollInCourse(string courseId, [FromBody] MockPaymentDto paymentDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User.FindFirst("name")?.Value ?? "Unknown";

            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var result = await _enrollmentService.EnrollInCourseAsync(userId, userName, courseId, paymentDto.CardNumber);
            if (!result.Success)
            {
                if (result.Message == "Course not found.") return NotFound(result.Message);
                return BadRequest(result.Message);
            }

            return Ok(new { Message = result.Message, EnrollmentDate = result.EnrollmentDate });
        }

        [HttpGet("my-courses")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var courses = await _enrollmentService.GetMyCoursesAsync(userId);
            return Ok(courses);
        }
    }

    public class MockPaymentDto
    {
        public string CardNumber { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string Cvv { get; set; } = string.Empty;
    }
}
