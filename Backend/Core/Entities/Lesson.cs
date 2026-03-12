using System;

namespace OnlineCoursePlatform.API.Core.Entities
{
    public class Lesson
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string VideoUrl { get; set; } = string.Empty;
        public int Order { get; set; }

        public Guid CourseId { get; set; }
        public Course? Course { get; set; }
    }
}
