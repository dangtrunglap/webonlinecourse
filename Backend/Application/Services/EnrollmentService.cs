using System.Text.Json;

namespace OnlineCoursePlatform.API.Application.Services;

public interface IEnrollmentService
{
    Task<(bool Success, string Message, DateTime EnrollmentDate)> EnrollInCourseAsync(string userId, string userName, string courseId, string cardNumber);
    Task<IEnumerable<MyCourseDto>> GetMyCoursesAsync(string userId);
}

public class EnrollmentService : IEnrollmentService
{
    private readonly IPocketBaseClient _pocketBase;

    public EnrollmentService(IPocketBaseClient pocketBase)
    {
        _pocketBase = pocketBase;
    }

    public async Task<(bool Success, string Message, DateTime EnrollmentDate)> EnrollInCourseAsync(string userId, string userName, string courseId, string cardNumber)
    {
        await _pocketBase.InitializeAsync();

        var course = await _pocketBase.GetCourseByIdAsync(courseId);
        if (course == null)
            return (false, "Course not found.", DateTime.UtcNow);

        if (string.IsNullOrWhiteSpace(cardNumber) || cardNumber.Length < 12)
            return (false, "Invalid payment details.", DateTime.UtcNow);

        if (await _pocketBase.HasActiveEntitlementAsync(userId, courseId))
            return (false, "Already enrolled in this course.", DateTime.UtcNow);

        var paymentRef = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}";
        var result = await _pocketBase.GrantEntitlementWithTransactionAsync(userId, userName, course, paymentRef);

        return (true, "Successfully enrolled.", result.EnrollmentDate);
    }

    public async Task<IEnumerable<MyCourseDto>> GetMyCoursesAsync(string userId)
    {
        await _pocketBase.InitializeAsync();

        var entitlements = await _pocketBase.GetUserEntitlementsAsync(userId);
        return entitlements
            .Where(item => item.TryGetValue("active", out var activeEl) && activeEl.ValueKind == JsonValueKind.True)
            .Select(item =>
            {
                var expand = item.TryGetValue("expand", out var expEl) && expEl.ValueKind == JsonValueKind.Object
                    ? expEl
                    : default;

                var course = default(JsonElement);
                if (expand.ValueKind == JsonValueKind.Object && expand.TryGetProperty("course", out var courseEl))
                {
                    if (courseEl.ValueKind == JsonValueKind.Object)
                    {
                        course = courseEl;
                    }
                    else if (courseEl.ValueKind == JsonValueKind.Array && courseEl.GetArrayLength() > 0)
                    {
                        course = courseEl[0];
                    }
                }

                return new MyCourseDto
                {
                    Id = course.ValueKind == JsonValueKind.Object && course.TryGetProperty("id", out var idEl) ? idEl.GetString() ?? string.Empty : string.Empty,
                    Title = course.ValueKind == JsonValueKind.Object && course.TryGetProperty("title", out var titleEl) ? titleEl.GetString() ?? string.Empty : string.Empty,
                    ThumbnailUrl = course.ValueKind == JsonValueKind.Object && course.TryGetProperty("thumbnailUrl", out var thumbEl) ? thumbEl.GetString() : null,
                    EnrollmentDate = ParseDate(item, "created")
                };
            })
            .Where(x => !string.IsNullOrWhiteSpace(x.Id));
    }

    private static DateTime ParseDate(Dictionary<string, JsonElement> item, string key)
    {
        if (!item.TryGetValue(key, out var el)) return DateTime.UtcNow;
        if (el.ValueKind == JsonValueKind.String && DateTime.TryParse(el.GetString(), out var parsed)) return parsed;
        return DateTime.UtcNow;
    }
}

public class MyCourseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public DateTime EnrollmentDate { get; set; }
}
