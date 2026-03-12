namespace OnlineCoursePlatform.API.Application.DTOs.Course
{
    public class CourseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string InstructorName { get; set; } = string.Empty;
        public string InstructorId { get; set; } = string.Empty;
    }

    public class CreateCourseDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
