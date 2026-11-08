using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineCoursePlatform.API.Application.DTOs.Auth;
using OnlineCoursePlatform.API.Application.Services;
using System.Security.Claims;
using System.Text.Json;

namespace OnlineCoursePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IPocketBaseClient _pocketBase;

        public AccountController(IPocketBaseClient pocketBase)
        {
            _pocketBase = pocketBase;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var record = await _pocketBase.GetUserRecordAsync(userId);
            if (record == null) return NotFound("Không tìm thấy thông tin tài khoản.");

            var plan = GetStringProp(record, "plan");
            if (string.IsNullOrWhiteSpace(plan)) plan = "Free";

            var maxDevices = 1;
            if (record.TryGetValue("maxDevices", out var maxDevEl) && maxDevEl.ValueKind == JsonValueKind.Number)
            {
                maxDevices = maxDevEl.GetInt32();
            }

            var consentGiven = record.TryGetValue("consentGiven", out var cgEl) && cgEl.ValueKind == JsonValueKind.True;
            var consentVersion = GetStringProp(record, "consentVersion");
            var consentTimestamp = GetStringProp(record, "consentTimestamp");
            var created = GetStringProp(record, "created");

            return Ok(new AccountProfileDto
            {
                Id = userId,
                Email = GetStringProp(record, "email") ?? User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                Name = GetStringProp(record, "name") ?? User.FindFirst("name")?.Value ?? string.Empty,
                Role = GetStringProp(record, "role") ?? "Student",
                Plan = plan,
                MaxDevices = maxDevices,
                IsActive = !record.TryGetValue("isActive", out var activeEl) || activeEl.ValueKind == JsonValueKind.True,
                ConsentGiven = consentGiven,
                ConsentVersion = consentVersion,
                ConsentTimestamp = consentTimestamp,
                Created = created
            });
        }

        [HttpGet("devices")]
        public async Task<IActionResult> GetDevices()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var devices = await _pocketBase.GetUserDevicesAsync(userId);
            var result = devices.Select(d => new DeviceItemDto
            {
                Id = GetStringProp(d, "id"),
                MachineName = string.IsNullOrWhiteSpace(GetStringProp(d, "machineName"))
                    ? "Máy tính (không tên)"
                    : GetStringProp(d, "machineName"),
                LastSeenAt = GetStringProp(d, "lastSeenAt"),
                IsBlocked = d.TryGetValue("isBlocked", out var bEl) && bEl.ValueKind == JsonValueKind.True
            }).ToList();

            return Ok(result);
        }

        [HttpDelete("devices/{deviceId}")]
        public async Task<IActionResult> UnlinkDevice(string deviceId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(deviceId))
                return BadRequest("Mã thiết bị không hợp lệ.");

            var success = await _pocketBase.DeleteUserDeviceAsync(userId, deviceId);
            if (!success)
            {
                return BadRequest(new { Message = "Không thể hủy liên kết thiết bị. Thiết bị có thể không thuộc tài khoản của bạn hoặc đã bị xóa trước đó." });
            }

            return Ok(new { Message = "Đã hủy liên kết thiết bị thành công." });
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportPersonalData()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var record = await _pocketBase.GetUserRecordAsync(userId);
            var devices = await _pocketBase.GetUserDevicesAsync(userId);
            var entitlements = await _pocketBase.GetUserEntitlementsAsync(userId);

            var exportData = new
            {
                exportedAt = DateTimeOffset.UtcNow.ToString("o"),
                decreeCompliance = "Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân",
                account = new
                {
                    userId,
                    email = GetStringProp(record ?? new(), "email") ?? email,
                    name = GetStringProp(record ?? new(), "name") ?? User.FindFirst("name")?.Value ?? string.Empty,
                    role = GetStringProp(record ?? new(), "role") ?? "Student",
                    plan = GetStringProp(record ?? new(), "plan") ?? "free",
                    maxDevices = record != null && record.TryGetValue("maxDevices", out var m) && m.ValueKind == JsonValueKind.Number ? m.GetInt32() : 1,
                    consentGiven = record != null && record.TryGetValue("consentGiven", out var cg) && cg.ValueKind == JsonValueKind.True,
                    consentVersion = record != null ? GetStringProp(record, "consentVersion") : "1.0",
                    consentTimestamp = record != null ? GetStringProp(record, "consentTimestamp") : null,
                    createdAt = record != null ? GetStringProp(record, "created") : null
                },
                linkedDevices = devices.Select(d => new
                {
                    id = GetStringProp(d, "id"),
                    machineName = GetStringProp(d, "machineName"),
                    lastSeenAt = GetStringProp(d, "lastSeenAt"),
                    isBlocked = d.TryGetValue("isBlocked", out var b) && b.ValueKind == JsonValueKind.True,
                    hardwareProperties = d.TryGetValue("fingerprintFields", out var fp) ? fp : default
                }),
                entitlements = entitlements.Select(e => new
                {
                    id = GetStringProp(e, "id"),
                    courseId = GetStringProp(e, "course"),
                    active = e.TryGetValue("active", out var a) && a.ValueKind == JsonValueKind.True,
                    created = GetStringProp(e, "created")
                })
            };

            return Ok(exportData);
        }

        [HttpPost("delete")]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(email))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { Message = "Vui lòng nhập mật khẩu tài khoản hiện tại để xác nhận xóa." });
            }

            // Verify credentials with PocketBase
            var authCheck = await _pocketBase.AuthenticateUserAsync(email, dto.Password);
            if (authCheck == null)
            {
                return BadRequest(new { Message = "Mật khẩu xác nhận không chính xác. Không thể thực hiện xóa tài khoản." });
            }

            // Execute account deletion (Right to Erasure under Decree 13/2023/ND-CP)
            var deleted = await _pocketBase.DeleteUserAccountAsync(userId);
            if (!deleted)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi xóa tài khoản trên hệ thống máy chủ. Vui lòng liên hệ ban quản trị." });
            }

            return Ok(new { Message = "Tài khoản và toàn bộ dữ liệu cá nhân liên quan đã được xóa vĩnh viễn theo Nghị định 13/2023/NĐ-CP." });
        }

        private static string GetStringProp(Dictionary<string, JsonElement> dict, string key)
        {
            if (dict != null && dict.TryGetValue(key, out var el) && el.ValueKind == JsonValueKind.String)
                return el.GetString() ?? string.Empty;
            return string.Empty;
        }
    }
}
