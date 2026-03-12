using System;
using System.Collections.Generic;

namespace OnlineCoursePlatform.API.Core.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; // Admin, Instructor, Student
        public string Name { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<Course> AuthoredCourses { get; set; } = new List<Course>();
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}
