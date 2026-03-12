using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineCoursePlatform.API.Core.Entities;
using OnlineCoursePlatform.API.Infrastructure.Data;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineCoursePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnrollmentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("{courseId}/enroll")]
        public async Task<IActionResult> EnrollInCourse(Guid courseId, [FromBody] MockPaymentDto paymentDto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            // Check if course exists
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return NotFound("Course not found.");

            // Check if already enrolled
            var existing = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);
            if (existing != null) return BadRequest("Already enrolled in this course.");

            // Mock Payment Logic
            if (string.IsNullOrWhiteSpace(paymentDto.CardNumber) || paymentDto.CardNumber.Length < 12)
                return BadRequest("Invalid payment details.");

            var enrollment = new Enrollment
            {
                UserId = userId,
                CourseId = courseId,
                PaymentStatus = "Completed"
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Successfully enrolled.", EnrollmentDate = enrollment.EnrollmentDate });
        }

        [HttpGet("my-courses")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.UserId == userId)
                .Select(e => new
                {
                    e.Course!.Id,
                    e.Course.Title,
                    e.Course.ThumbnailUrl,
                    e.EnrollmentDate
                })
                .ToListAsync();

            return Ok(enrollments);
        }
    }

    public class MockPaymentDto
    {
        public string CardNumber { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string Cvv { get; set; } = string.Empty;
    }
}
