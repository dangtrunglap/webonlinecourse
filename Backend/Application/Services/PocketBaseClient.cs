using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace OnlineCoursePlatform.API.Application.Services;

public class PocketBaseOptions
{
    public string BaseUrl { get; set; } = "http://127.0.0.1:8090";
    public string SuperuserEmail { get; set; } = string.Empty;
    public string SuperuserPassword { get; set; } = string.Empty;

    public string UsersCollection { get; set; } = "users";
    public string CoursesCollection { get; set; } = "courses";
    public string EntitlementsCollection { get; set; } = "entitlements";
    public string TransactionsCollection { get; set; } = "orders";
}

public record PocketBaseAuthResult(string UserId, string Email, string Name, string Role, string RawToken);
public record UserProfile(string UserId, string Name, string Role);
public record EntitlementResult(bool IsNew, DateTime EnrollmentDate);
public class PocketBaseRequestException(HttpStatusCode statusCode, string message) : Exception(message)
{
    public HttpStatusCode StatusCode { get; } = statusCode;
}

public interface IPocketBaseClient
{
    Task InitializeAsync();
    Task<PocketBaseAuthResult?> AuthenticateUserAsync(string email, string password);
    Task<PocketBaseAuthResult?> RegisterUserAsync(string name, string email, string password, string role);
    Task<UserProfile?> GetUserProfileAsync(string userId);

    Task<(IReadOnlyList<Dictionary<string, JsonElement>> Items, int TotalItems)> GetCoursesAsync(string? search, int page, int pageSize);
    Task<Dictionary<string, JsonElement>?> GetCourseByIdAsync(string id);
    Task<Dictionary<string, JsonElement>> CreateCourseAsync(string title, string description, decimal price, string instructorId, string instructorName);
    Task<Dictionary<string, JsonElement>> UpdateCourseAsync(string id, string title, string description, decimal price);
    Task<bool> DeleteCourseAsync(string id);
    Task<bool> UpdateCourseThumbnailAsync(string id, string thumbnailUrl);

    Task<bool> HasActiveEntitlementAsync(string userId, string courseId);
    Task<EntitlementResult> GrantEntitlementWithTransactionAsync(string userId, string userName, Dictionary<string, JsonElement> course, string paymentRef);
    Task<IReadOnlyList<Dictionary<string, JsonElement>>> GetUserEntitlementsAsync(string userId);
}

public class PocketBaseClient : IPocketBaseClient
{
    private readonly HttpClient _http;
    private readonly PocketBaseOptions _options;

    private string? _adminToken;

    public PocketBaseClient(HttpClient http, IOptions<PocketBaseOptions> options)
    {
        _http = http;
        _options = options.Value;

        if (string.IsNullOrWhiteSpace(_options.BaseUrl))
            throw new InvalidOperationException("PocketBase:BaseUrl is not configured.");

        _http.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");
    }

    public async Task InitializeAsync()
    {
        await EnsureAdminTokenAsync();
    }

    public async Task<PocketBaseAuthResult?> AuthenticateUserAsync(string email, string password)
    {
        var endpoint = $"api/collections/{_options.UsersCollection}/auth-with-password";
        var response = await _http.PostAsJsonAsync(endpoint, new { identity = email, password });
        if (!response.IsSuccessStatusCode)
            return null;

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var token = doc.RootElement.GetProperty("token").GetString() ?? string.Empty;
        var record = doc.RootElement.GetProperty("record");

        var userId = record.GetProperty("id").GetString() ?? string.Empty;
        var userEmail = record.GetProperty("email").GetString() ?? email;
        var userName = record.TryGetProperty("name", out var nameEl) && nameEl.ValueKind == JsonValueKind.String
            ? nameEl.GetString() ?? userEmail
            : userEmail;
        var role = record.TryGetProperty("role", out var roleEl) && roleEl.ValueKind == JsonValueKind.String
            ? NormalizeRole(roleEl.GetString())
            : "Student";

        return new PocketBaseAuthResult(userId, userEmail, userName, role, token);
    }

    public async Task<PocketBaseAuthResult?> RegisterUserAsync(string name, string email, string password, string role)
    {
        await EnsureAdminTokenAsync();

        var createResponse = await SendAdminAsync(HttpMethod.Post, $"api/collections/{_options.UsersCollection}/records", new
        {
            email,
            password,
            passwordConfirm = password,
            name,
            role = NormalizeRole(role),
            plan = "free",
            maxDevices = 1,
            isActive = true
        });

        if (createResponse.StatusCode == HttpStatusCode.BadRequest || createResponse.StatusCode == HttpStatusCode.UnprocessableEntity)
            return null;

        createResponse.EnsureSuccessStatusCode();
        return await AuthenticateUserAsync(email, password);
    }

    public async Task<UserProfile?> GetUserProfileAsync(string userId)
    {
        await EnsureAdminTokenAsync();

        var response = await SendAdminAsync(HttpMethod.Get, $"api/collections/{_options.UsersCollection}/records/{userId}");
        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;
        var name = root.TryGetProperty("name", out var nameEl) ? nameEl.GetString() ?? "Unknown" : "Unknown";
        var role = root.TryGetProperty("role", out var roleEl) ? NormalizeRole(roleEl.GetString()) : "Student";
        return new UserProfile(userId, name, role);
    }

    public async Task<(IReadOnlyList<Dictionary<string, JsonElement>> Items, int TotalItems)> GetCoursesAsync(string? search, int page, int pageSize)
    {
        await EnsureAdminTokenAsync();

        var query = new StringBuilder($"api/collections/{_options.CoursesCollection}/records?page={page}&perPage={pageSize}&sort=title");
        if (!string.IsNullOrWhiteSpace(search))
        {
            var filterRaw = $"title ~ '{EscapeFilter(search)}' || description ~ '{EscapeFilter(search)}'";
            query.Append($"&filter={Uri.EscapeDataString(filterRaw)}");
        }

        var response = await SendAdminAsync(HttpMethod.Get, query.ToString());
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var items = doc.RootElement.GetProperty("items").EnumerateArray().Select(ToDictionary).ToList();
        var total = doc.RootElement.TryGetProperty("totalItems", out var totalEl) ? totalEl.GetInt32() : items.Count;
        return (items, total);
    }

    public async Task<Dictionary<string, JsonElement>?> GetCourseByIdAsync(string id)
    {
        await EnsureAdminTokenAsync();
        var response = await SendAdminAsync(HttpMethod.Get, $"api/collections/{_options.CoursesCollection}/records/{id}");
        if (response.StatusCode == HttpStatusCode.NotFound) return null;

        response.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return ToDictionary(doc.RootElement);
    }

    public async Task<Dictionary<string, JsonElement>> CreateCourseAsync(string title, string description, decimal price, string instructorId, string instructorName)
    {
        await EnsureAdminTokenAsync();
        var slug = BuildSlug(title);

        var response = await SendAdminAsync(HttpMethod.Post, $"api/collections/{_options.CoursesCollection}/records", new
        {
            title,
            description,
            price,
            thumbnailUrl = string.Empty,
            instructorId,
            instructorName,
            slug,
            published = true,
            sortOrder = 0,
            version = 1
        });

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new PocketBaseRequestException(response.StatusCode, BuildPocketBaseErrorMessage(body, "Tạo khóa học thất bại trên PocketBase."));
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return ToDictionary(doc.RootElement);
    }

    public async Task<Dictionary<string, JsonElement>> UpdateCourseAsync(string id, string title, string description, decimal price)
    {
        await EnsureAdminTokenAsync();

        var response = await SendAdminAsync(HttpMethod.Patch, $"api/collections/{_options.CoursesCollection}/records/{id}", new
        {
            title,
            description,
            price
        });

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new PocketBaseRequestException(response.StatusCode, BuildPocketBaseErrorMessage(body, "Cập nhật khóa học thất bại trên PocketBase."));
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return ToDictionary(doc.RootElement);
    }

    public async Task<bool> DeleteCourseAsync(string id)
    {
        await EnsureAdminTokenAsync();
        var response = await SendAdminAsync(HttpMethod.Delete, $"api/collections/{_options.CoursesCollection}/records/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> UpdateCourseThumbnailAsync(string id, string thumbnailUrl)
    {
        await EnsureAdminTokenAsync();
        var response = await SendAdminAsync(HttpMethod.Patch, $"api/collections/{_options.CoursesCollection}/records/{id}", new { thumbnailUrl });
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> HasActiveEntitlementAsync(string userId, string courseId)
    {
        await EnsureAdminTokenAsync();

        var filter = Uri.EscapeDataString($"user = '{EscapeFilter(userId)}'");
        var response = await SendAdminAsync(HttpMethod.Get, $"api/collections/{_options.EntitlementsCollection}/records?perPage=200&filter={filter}");
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        foreach (var item in doc.RootElement.GetProperty("items").EnumerateArray())
        {
            var active = item.TryGetProperty("active", out var activeEl) && activeEl.ValueKind == JsonValueKind.True;
            var courseEl = item.TryGetProperty("course", out var cEl) ? cEl : default;
            string value = string.Empty;
            if (courseEl.ValueKind == JsonValueKind.String)
                value = courseEl.GetString() ?? string.Empty;
            else if (courseEl.ValueKind == JsonValueKind.Array && courseEl.GetArrayLength() > 0)
                value = courseEl[0].GetString() ?? string.Empty;

            if (active && string.Equals(value, courseId, StringComparison.Ordinal))
                return true;
        }

        return false;
    }

    public async Task<EntitlementResult> GrantEntitlementWithTransactionAsync(string userId, string userName, Dictionary<string, JsonElement> course, string paymentRef)
    {
        await EnsureAdminTokenAsync();

        var courseId = GetString(course, "id");
        var amount = GetDecimal(course, "price");
        var courseTitle = GetString(course, "title");

        var orderResponse = await SendAdminAsync(HttpMethod.Post, $"api/collections/{_options.TransactionsCollection}/records", new
        {
            user = userId,
            items = courseId,
            status = "paid",
            amount,
            note = $"Auto payment for {courseTitle}",
            paymentRef,
            approvedBy = userName,
            granted = true
        });

        orderResponse.EnsureSuccessStatusCode();
        using var orderDoc = JsonDocument.Parse(await orderResponse.Content.ReadAsStringAsync());
        var orderId = orderDoc.RootElement.GetProperty("id").GetString() ?? string.Empty;

        if (await HasActiveEntitlementAsync(userId, courseId))
            return new EntitlementResult(false, DateTime.UtcNow);

        var now = DateTime.UtcNow;
        var entitlementResponse = await SendAdminAsync(HttpMethod.Post, $"api/collections/{_options.EntitlementsCollection}/records", new
        {
            user = userId,
            course = courseId,
            active = true,
            sourceOrder = string.IsNullOrWhiteSpace(orderId) ? null : orderId
        });

        entitlementResponse.EnsureSuccessStatusCode();
        return new EntitlementResult(true, now);
    }

    public async Task<IReadOnlyList<Dictionary<string, JsonElement>>> GetUserEntitlementsAsync(string userId)
    {
        await EnsureAdminTokenAsync();

        var filter = Uri.EscapeDataString($"user = '{EscapeFilter(userId)}'");
        var response = await SendAdminAsync(HttpMethod.Get, $"api/collections/{_options.EntitlementsCollection}/records?perPage=200&expand=course&filter={filter}");
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("items").EnumerateArray().Select(ToDictionary).ToList();
    }

    private async Task EnsureAdminTokenAsync()
    {
        if (!string.IsNullOrWhiteSpace(_adminToken)) return;

        if (string.IsNullOrWhiteSpace(_options.SuperuserEmail) || string.IsNullOrWhiteSpace(_options.SuperuserPassword))
            throw new InvalidOperationException("PocketBase superuser credentials are not configured.");

        var response = await _http.PostAsJsonAsync("api/collections/_superusers/auth-with-password", new
        {
            identity = _options.SuperuserEmail,
            password = _options.SuperuserPassword
        });

        response.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        _adminToken = doc.RootElement.GetProperty("token").GetString();
    }

    private async Task<HttpResponseMessage> SendAdminAsync(HttpMethod method, string path, object? body = null)
    {
        await EnsureAdminTokenAsync();

        using var request = new HttpRequestMessage(method, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _adminToken);
        if (body != null)
            request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        if (response.StatusCode != HttpStatusCode.Unauthorized) return response;

        _adminToken = null;
        await EnsureAdminTokenAsync();

        using var retry = new HttpRequestMessage(method, path);
        retry.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _adminToken);
        if (body != null)
            retry.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        return await _http.SendAsync(retry);
    }

    private static Dictionary<string, JsonElement> ToDictionary(JsonElement element)
        => JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(element.GetRawText()) ?? new Dictionary<string, JsonElement>();

    private static string EscapeFilter(string value) => value.Replace("'", "\\'");

    private static string BuildPocketBaseErrorMessage(string body, string fallback)
    {
        if (string.IsNullOrWhiteSpace(body)) return fallback;

        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            var message = root.TryGetProperty("message", out var messageEl) && messageEl.ValueKind == JsonValueKind.String
                ? messageEl.GetString() ?? fallback
                : fallback;

            if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Object)
            {
                var fieldMessages = dataEl.EnumerateObject()
                    .Select(field =>
                    {
                        if (field.Value.ValueKind != JsonValueKind.Object ||
                            !field.Value.TryGetProperty("message", out var fieldMessageEl) ||
                            fieldMessageEl.ValueKind != JsonValueKind.String)
                        {
                            return null;
                        }

                        return $"{field.Name}: {fieldMessageEl.GetString()}";
                    })
                    .Where(value => !string.IsNullOrWhiteSpace(value))
                    .ToList();

                if (fieldMessages.Count > 0)
                    return $"{message} {string.Join("; ", fieldMessages)}";
            }

            return message;
        }
        catch (JsonException)
        {
            return fallback;
        }
    }

    private static string NormalizeRole(string? role)
    {
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)) return "Admin";
        if (string.Equals(role, "Instructor", StringComparison.OrdinalIgnoreCase)) return "Instructor";
        return "Student";
    }

    private static string GetString(Dictionary<string, JsonElement> item, string key)
        => item.TryGetValue(key, out var el) && el.ValueKind == JsonValueKind.String ? (el.GetString() ?? string.Empty) : string.Empty;

    private static decimal GetDecimal(Dictionary<string, JsonElement> item, string key)
    {
        if (!item.TryGetValue(key, out var el)) return 0;
        if (el.ValueKind == JsonValueKind.Number && el.TryGetDecimal(out var number)) return number;
        if (el.ValueKind == JsonValueKind.String && decimal.TryParse(el.GetString(), out var parsed)) return parsed;
        return 0;
    }

    private static string BuildSlug(string title)
    {
        var slug = new string(title.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray());
        while (slug.Contains("--")) slug = slug.Replace("--", "-");
        slug = slug.Trim('-');
        var suffix = Guid.NewGuid().ToString("N");
        if (string.IsNullOrWhiteSpace(slug)) return $"course-{suffix}";
        var combined = $"{slug}-{suffix}";
        return combined.Length > 80 ? combined[..80] : combined;
    }
}
