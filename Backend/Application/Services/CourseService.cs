using OnlineCoursePlatform.API.Application.DTOs.Course;
using System.Text.Json;

namespace OnlineCoursePlatform.API.Application.Services;

public interface ICourseService
{
    Task<(IEnumerable<CourseDto> Courses, int TotalCount)> GetCoursesAsync(string? search, int pageNumber, int pageSize);
    Task<CourseDto?> GetCourseByIdAsync(string id);
    Task<CourseDto> CreateCourseAsync(CreateCourseDto dto, string instructorId, string instructorName);
    Task<bool> DeleteCourseAsync(string id, string currentUserId, string role);
    Task<string?> UpdateThumbnailAsync(string id, string thumbnailUrl, string currentUserId, string role);
}

public class CourseService : ICourseService
{
    private readonly IPocketBaseClient _pocketBase;

    public CourseService(IPocketBaseClient pocketBase)
    {
        _pocketBase = pocketBase;
    }

    public async Task<(IEnumerable<CourseDto> Courses, int TotalCount)> GetCoursesAsync(string? search, int pageNumber, int pageSize)
    {
        await _pocketBase.InitializeAsync();

        var (items, total) = await _pocketBase.GetCoursesAsync(search, pageNumber, pageSize);
        var courses = items.Select(MapCourse).ToList();
        return (courses, total);
    }

    public async Task<CourseDto?> GetCourseByIdAsync(string id)
    {
        await _pocketBase.InitializeAsync();
        var item = await _pocketBase.GetCourseByIdAsync(id);
        return item == null ? null : MapCourse(item);
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseDto dto, string instructorId, string instructorName)
    {
        await _pocketBase.InitializeAsync();
        var item = await _pocketBase.CreateCourseAsync(dto.Title, dto.Description, dto.Price, instructorId, instructorName);
        return MapCourse(item);
    }

    public async Task<bool> DeleteCourseAsync(string id, string currentUserId, string role)
    {
        await _pocketBase.InitializeAsync();
        var item = await _pocketBase.GetCourseByIdAsync(id);
        if (item == null) return false;

        var instructorId = GetString(item, "instructorId");
        var isAdmin = string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && !string.Equals(instructorId, currentUserId, StringComparison.Ordinal))
            return false;

        return await _pocketBase.DeleteCourseAsync(id);
    }

    public async Task<string?> UpdateThumbnailAsync(string id, string thumbnailUrl, string currentUserId, string role)
    {
        await _pocketBase.InitializeAsync();
        var item = await _pocketBase.GetCourseByIdAsync(id);
        if (item == null) return null;

        var instructorId = GetString(item, "instructorId");
        var isAdmin = string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && !string.Equals(instructorId, currentUserId, StringComparison.Ordinal))
            return null;

        var updated = await _pocketBase.UpdateCourseThumbnailAsync(id, thumbnailUrl);
        return updated ? thumbnailUrl : null;
    }

    private static CourseDto MapCourse(Dictionary<string, JsonElement> item)
    {
        return new CourseDto
        {
            Id = GetString(item, "id"),
            Title = GetString(item, "title"),
            Description = GetString(item, "description"),
            Price = GetDecimal(item, "price"),
            ThumbnailUrl = GetNullableString(item, "thumbnailUrl"),
            InstructorId = GetString(item, "instructorId"),
            InstructorName = GetString(item, "instructorName")
        };
    }

    private static string GetString(Dictionary<string, JsonElement> item, string key)
        => item.TryGetValue(key, out var el) && el.ValueKind == JsonValueKind.String ? (el.GetString() ?? string.Empty) : string.Empty;

    private static string? GetNullableString(Dictionary<string, JsonElement> item, string key)
        => item.TryGetValue(key, out var el) && el.ValueKind == JsonValueKind.String ? el.GetString() : null;

    private static decimal GetDecimal(Dictionary<string, JsonElement> item, string key)
    {
        if (!item.TryGetValue(key, out var el)) return 0;
        if (el.ValueKind == JsonValueKind.Number && el.TryGetDecimal(out var number)) return number;
        if (el.ValueKind == JsonValueKind.String && decimal.TryParse(el.GetString(), out var parsed)) return parsed;
        return 0;
    }
}
