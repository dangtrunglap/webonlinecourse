namespace OnlineCoursePlatform.API.Application.DTOs.Auth
{
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; // Student or Instructor
        public bool ConsentGiven { get; set; } = false;
        public string ConsentVersion { get; set; } = "1.0";
        public string? ConsentTimestamp { get; set; }
    }

    public class AuthResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class DeleteAccountDto
    {
        public string Password { get; set; } = string.Empty;
    }

    public class DeviceItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string MachineName { get; set; } = string.Empty;
        public string? LastSeenAt { get; set; }
        public bool IsBlocked { get; set; }
    }

    public class AccountProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Plan { get; set; } = "Free";
        public int MaxDevices { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public bool ConsentGiven { get; set; }
        public string ConsentVersion { get; set; } = string.Empty;
        public string? ConsentTimestamp { get; set; }
        public string? Created { get; set; }
    }
}
