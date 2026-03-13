using System.Text.Json;
using OnlineCoursePlatform.API.Application.DTOs.Content;
using Microsoft.AspNetCore.Hosting;

namespace OnlineCoursePlatform.API.Application.Services;

public interface ICommunityContentService
{
    Task<IReadOnlyList<BlogPostDto>> GetBlogPostsAsync(string? courseId, string? instructorId, int? limit);
    Task<BlogPostDto?> GetBlogPostByIdAsync(string id);
    Task<BlogPostDto> CreateBlogPostAsync(CreateBlogPostDto dto, string currentUserId, string currentUserName, string role);
    Task<bool> DeleteBlogPostAsync(string id, string currentUserId, string role);

    Task<IReadOnlyList<ResourceFileDto>> GetResourcesAsync(string? courseId, string? instructorId, int? limit);
    Task<ResourceFileDto> CreateResourceAsync(CreateResourceDto dto, StoredFileDetails file, string currentUserId, string currentUserName, string role);
    Task<ResourceDeleteResult> DeleteResourceAsync(string id, string currentUserId, string role);
}

public record ResourceDeleteResult(bool Deleted, string? FileUrl);

public class CommunityContentService : ICommunityContentService
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private static readonly SemaphoreSlim SyncLock = new(1, 1);

    private readonly IPocketBaseClient _pocketBase;
    private readonly string _blogPostsPath;
    private readonly string _resourceFilesPath;

    public CommunityContentService(IPocketBaseClient pocketBase, IWebHostEnvironment environment)
    {
        _pocketBase = pocketBase;

        var dataRoot = Path.Combine(environment.ContentRootPath, "App_Data", "community");
        Directory.CreateDirectory(dataRoot);

        _blogPostsPath = Path.Combine(dataRoot, "blog-posts.json");
        _resourceFilesPath = Path.Combine(dataRoot, "resource-files.json");
    }

    public async Task<IReadOnlyList<BlogPostDto>> GetBlogPostsAsync(string? courseId, string? instructorId, int? limit)
    {
        var posts = await LoadAsync<BlogPostRecord>(_blogPostsPath);
        var query = posts.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(courseId))
            query = query.Where(post => string.Equals(post.CourseId, courseId, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(instructorId))
            query = query.Where(post => string.Equals(post.InstructorId, instructorId, StringComparison.OrdinalIgnoreCase));

        query = query
            .OrderByDescending(post => post.Featured)
            .ThenByDescending(post => post.PublishedAt);

        if (limit.HasValue && limit.Value > 0)
            query = query.Take(limit.Value);

        return query.Select(MapBlogPost).ToList();
    }

    public async Task<BlogPostDto?> GetBlogPostByIdAsync(string id)
    {
        var posts = await LoadAsync<BlogPostRecord>(_blogPostsPath);
        var post = posts.FirstOrDefault(item => string.Equals(item.Id, id, StringComparison.OrdinalIgnoreCase));
        return post == null ? null : MapBlogPost(post);
    }

    public async Task<BlogPostDto> CreateBlogPostAsync(CreateBlogPostDto dto, string currentUserId, string currentUserName, string role)
    {
        var courseContext = await ResolveCourseContextAsync(dto.CourseId, currentUserId, role);
        var record = new BlogPostRecord
        {
            Id = Guid.NewGuid().ToString("N"),
            Title = dto.Title.Trim(),
            Summary = dto.Summary.Trim(),
            Content = dto.Content.Trim(),
            InstructorId = currentUserId,
            InstructorName = currentUserName,
            CourseId = courseContext.CourseId,
            CourseTitle = courseContext.CourseTitle,
            Featured = dto.Featured,
            PublishedAt = DateTime.UtcNow
        };

        await SyncLock.WaitAsync();
        try
        {
            var posts = await LoadAsync<BlogPostRecord>(_blogPostsPath);
            posts.Add(record);
            await SaveAsync(_blogPostsPath, posts);
        }
        finally
        {
            SyncLock.Release();
        }

        return MapBlogPost(record);
    }

    public async Task<bool> DeleteBlogPostAsync(string id, string currentUserId, string role)
    {
        await SyncLock.WaitAsync();
        try
        {
            var posts = await LoadAsync<BlogPostRecord>(_blogPostsPath);
            var post = posts.FirstOrDefault(item => string.Equals(item.Id, id, StringComparison.OrdinalIgnoreCase));
            if (post == null)
                return false;

            if (!CanManageContent(post.InstructorId, currentUserId, role))
                return false;

            posts.Remove(post);
            await SaveAsync(_blogPostsPath, posts);
            return true;
        }
        finally
        {
            SyncLock.Release();
        }
    }

    public async Task<IReadOnlyList<ResourceFileDto>> GetResourcesAsync(string? courseId, string? instructorId, int? limit)
    {
        var resources = await LoadAsync<ResourceFileRecord>(_resourceFilesPath);
        var query = resources.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(courseId))
            query = query.Where(resource => string.Equals(resource.CourseId, courseId, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(instructorId))
            query = query.Where(resource => string.Equals(resource.InstructorId, instructorId, StringComparison.OrdinalIgnoreCase));

        query = query.OrderByDescending(resource => resource.PublishedAt);

        if (limit.HasValue && limit.Value > 0)
            query = query.Take(limit.Value);

        return query.Select(MapResource).ToList();
    }

    public async Task<ResourceFileDto> CreateResourceAsync(CreateResourceDto dto, StoredFileDetails file, string currentUserId, string currentUserName, string role)
    {
        var courseContext = await ResolveCourseContextAsync(dto.CourseId, currentUserId, role);
        var record = new ResourceFileRecord
        {
            Id = Guid.NewGuid().ToString("N"),
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            FileName = file.FileName,
            FileUrl = file.FileUrl,
            FileExtension = file.FileExtension,
            FileSize = file.FileSize,
            InstructorId = currentUserId,
            InstructorName = currentUserName,
            CourseId = courseContext.CourseId,
            CourseTitle = courseContext.CourseTitle,
            PublishedAt = DateTime.UtcNow
        };

        await SyncLock.WaitAsync();
        try
        {
            var resources = await LoadAsync<ResourceFileRecord>(_resourceFilesPath);
            resources.Add(record);
            await SaveAsync(_resourceFilesPath, resources);
        }
        finally
        {
            SyncLock.Release();
        }

        return MapResource(record);
    }

    public async Task<ResourceDeleteResult> DeleteResourceAsync(string id, string currentUserId, string role)
    {
        await SyncLock.WaitAsync();
        try
        {
            var resources = await LoadAsync<ResourceFileRecord>(_resourceFilesPath);
            var resource = resources.FirstOrDefault(item => string.Equals(item.Id, id, StringComparison.OrdinalIgnoreCase));
            if (resource == null)
                return new ResourceDeleteResult(false, null);

            if (!CanManageContent(resource.InstructorId, currentUserId, role))
                return new ResourceDeleteResult(false, null);

            resources.Remove(resource);
            await SaveAsync(_resourceFilesPath, resources);
            return new ResourceDeleteResult(true, resource.FileUrl);
        }
        finally
        {
            SyncLock.Release();
        }
    }

    private async Task<CourseContext> ResolveCourseContextAsync(string? courseId, string currentUserId, string role)
    {
        if (string.IsNullOrWhiteSpace(courseId))
            return new CourseContext(null, null);

        await _pocketBase.InitializeAsync();
        var course = await _pocketBase.GetCourseByIdAsync(courseId);
        if (course == null)
            throw new InvalidOperationException("Khóa học không tồn tại.");

        var instructorId = GetString(course, "instructorId");
        if (!CanManageContent(instructorId, currentUserId, role))
            throw new UnauthorizedAccessException("Bạn không có quyền gắn nội dung vào khóa học này.");

        return new CourseContext(courseId, GetString(course, "title"));
    }

    private static bool CanManageContent(string ownerId, string currentUserId, string role)
    {
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            return true;

        return string.Equals(ownerId, currentUserId, StringComparison.Ordinal);
    }

    private static async Task<List<T>> LoadAsync<T>(string filePath)
    {
        if (!File.Exists(filePath))
            return new List<T>();

        var json = await File.ReadAllTextAsync(filePath);
        if (string.IsNullOrWhiteSpace(json))
            return new List<T>();

        return JsonSerializer.Deserialize<List<T>>(json, SerializerOptions) ?? new List<T>();
    }

    private static async Task SaveAsync<T>(string filePath, List<T> items)
    {
        var json = JsonSerializer.Serialize(items, SerializerOptions);
        await File.WriteAllTextAsync(filePath, json);
    }

    private static BlogPostDto MapBlogPost(BlogPostRecord post)
    {
        return new BlogPostDto
        {
            Id = post.Id,
            Title = post.Title,
            Summary = post.Summary,
            Content = post.Content,
            InstructorId = post.InstructorId,
            InstructorName = post.InstructorName,
            CourseId = post.CourseId,
            CourseTitle = post.CourseTitle,
            Featured = post.Featured,
            PublishedAt = post.PublishedAt
        };
    }

    private static ResourceFileDto MapResource(ResourceFileRecord resource)
    {
        return new ResourceFileDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Description = resource.Description,
            FileName = resource.FileName,
            FileUrl = resource.FileUrl,
            FileExtension = resource.FileExtension,
            FileSize = resource.FileSize,
            InstructorId = resource.InstructorId,
            InstructorName = resource.InstructorName,
            CourseId = resource.CourseId,
            CourseTitle = resource.CourseTitle,
            PublishedAt = resource.PublishedAt
        };
    }

    private static string GetString(Dictionary<string, JsonElement> item, string key)
        => item.TryGetValue(key, out var element) && element.ValueKind == JsonValueKind.String
            ? element.GetString() ?? string.Empty
            : string.Empty;

    private sealed class BlogPostRecord
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string InstructorId { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public string? CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public bool Featured { get; set; }
        public DateTime PublishedAt { get; set; }
    }

    private sealed class ResourceFileRecord
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileExtension { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string InstructorId { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public string? CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public DateTime PublishedAt { get; set; }
    }

    private sealed record CourseContext(string? CourseId, string? CourseTitle);
}

