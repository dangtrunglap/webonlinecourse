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
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Vui lòng nhập tiêu đề khóa học.")]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [System.ComponentModel.DataAnnotations.Range(1, double.MaxValue, ErrorMessage = "Vui lòng nhập giá khóa học lớn hơn 0.")]
        public decimal Price { get; set; }
    }
}
