using System;

namespace OnlineCoursePlatform.API.Core.Entities
{
    public class Enrollment
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid CourseId { get; set; }
        public Course? Course { get; set; }

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
        public string PaymentStatus { get; set; } = "Completed"; // Mock payment statuses
    }
}
