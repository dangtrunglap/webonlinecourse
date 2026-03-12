using Microsoft.EntityFrameworkCore;
using OnlineCoursePlatform.API.Application.DTOs.Course;
using OnlineCoursePlatform.API.Core.Entities;
using OnlineCoursePlatform.API.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlineCoursePlatform.API.Application.Services
{
    public interface ICourseService
    {
        Task<(IEnumerable<CourseDto> Courses, int TotalCount)> GetCoursesAsync(string? search, int pageNumber, int pageSize);
        Task<CourseDto?> GetCourseByIdAsync(Guid id);
        Task<CourseDto> CreateCourseAsync(CreateCourseDto dto, Guid instructorId, string instructorName);
        Task<bool> DeleteCourseAsync(Guid id, Guid currentUserId, string role);
        Task<string?> UpdateThumbnailAsync(Guid id, string thumbnailUrl, Guid currentUserId, string role);
    }

    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<CourseDto> Courses, int TotalCount)> GetCoursesAsync(string? search, int pageNumber, int pageSize)
        {
            var query = _context.Courses.Include(c => c.Instructor).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(lowerSearch) || c.Description.ToLower().Contains(lowerSearch));
            }

            var totalCount = await query.CountAsync();

            var courses = await query
                .OrderBy(c => c.Title)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Price = c.Price,
                    ThumbnailUrl = c.ThumbnailUrl,
                    InstructorName = c.Instructor!.Name,
                    InstructorId = c.InstructorId
                })
                .ToListAsync();

            return (courses, totalCount);
        }

        public async Task<CourseDto?> GetCourseByIdAsync(Guid id)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null) return null;

            return new CourseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Price = course.Price,
                ThumbnailUrl = course.ThumbnailUrl,
                InstructorName = course.Instructor!.Name,
                InstructorId = course.InstructorId
            };
        }

        public async Task<CourseDto> CreateCourseAsync(CreateCourseDto dto, Guid instructorId, string instructorName)
        {
            var course = new Course
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                InstructorId = instructorId
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return new CourseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Price = course.Price,
                ThumbnailUrl = course.ThumbnailUrl,
                InstructorName = instructorName,
                InstructorId = course.InstructorId
            };
        }

        public async Task<bool> DeleteCourseAsync(Guid id, Guid currentUserId, string role)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return false;

            if (role != "Admin" && course.InstructorId != currentUserId) return false;

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string?> UpdateThumbnailAsync(Guid id, string thumbnailUrl, Guid currentUserId, string role)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return null;

            if (role != "Admin" && course.InstructorId != currentUserId) return null;

            course.ThumbnailUrl = thumbnailUrl;
            await _context.SaveChangesAsync();

            return thumbnailUrl;
        }
    }
}
