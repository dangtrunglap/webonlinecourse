using Microsoft.EntityFrameworkCore;
using OnlineCoursePlatform.API.Core.Entities;
using System;

namespace OnlineCoursePlatform.API.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Entity Relationships

            // Enrollment (Many-to-Many join entity)
            modelBuilder.Entity<Enrollment>()
                .HasKey(e => new { e.UserId, e.CourseId });

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.User)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId);

            // Instructor relationship
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Instructor)
                .WithMany(u => u.AuthoredCourses)
                .HasForeignKey(c => c.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Lesson to Course
            modelBuilder.Entity<Lesson>()
                .HasOne(l => l.Course)
                .WithMany(c => c.Lessons)
                .HasForeignKey(l => l.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed initial data
            var adminId = Guid.NewGuid();
            var instructorId = Guid.NewGuid();
            var studentId = Guid.NewGuid();

            modelBuilder.Entity<User>().HasData(
                new User { Id = adminId, Name = "Admin User", Email = "admin@example.com", Role = "Admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!") },
                new User { Id = instructorId, Name = "Instructor John", Email = "instructor@example.com", Role = "Instructor", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!") },
                new User { Id = studentId, Name = "Student Jane", Email = "student@example.com", Role = "Student", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!") }
            );

            var courseId = Guid.NewGuid();
            modelBuilder.Entity<Course>().HasData(
                new Course { Id = courseId, Title = "Mastering React", Description = "Learn React from scratch to advanced topics.", Price = 49.99m, InstructorId = instructorId }
            );

            modelBuilder.Entity<Lesson>().HasData(
                new Lesson { Id = Guid.NewGuid(), Title = "Introduction to React", VideoUrl = "https://example.com/video1.mp4", Order = 1, CourseId = courseId },
                new Lesson { Id = Guid.NewGuid(), Title = "State and Props", VideoUrl = "https://example.com/video2.mp4", Order = 2, CourseId = courseId }
            );
        }
    }
}
