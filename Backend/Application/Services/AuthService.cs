using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OnlineCoursePlatform.API.Application.DTOs.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OnlineCoursePlatform.API.Application.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly IPocketBaseClient _pocketBase;

    public AuthService(IConfiguration config, IPocketBaseClient pocketBase)
    {
        _config = config;
        _pocketBase = pocketBase;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        await _pocketBase.InitializeAsync();

        var auth = await _pocketBase.RegisterUserAsync(dto.Name, dto.Email, dto.Password, dto.Role);
        if (auth == null)
            return null;

        return GenerateAuthResponse(auth.UserId, auth.Email, auth.Name, auth.Role);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        await _pocketBase.InitializeAsync();

        var auth = await _pocketBase.AuthenticateUserAsync(dto.Email, dto.Password);
        if (auth == null)
            return null;

        return GenerateAuthResponse(auth.UserId, auth.Email, auth.Name, auth.Role);
    }

    private AuthResponseDto GenerateAuthResponse(string userId, string email, string name, string role)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(ClaimTypes.NameIdentifier, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new(CustomClaims.Name, name),
            new(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expireDays = int.Parse(_config["Jwt:ExpireDays"] ?? "7");

        var token = new JwtSecurityToken(
            _config["Jwt:Issuer"],
            _config["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddDays(expireDays),
            signingCredentials: creds
        );

        return new AuthResponseDto
        {
            Id = userId,
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Name = name,
            Email = email,
            Role = role
        };
    }
}

public static class CustomClaims
{
    public const string Name = "name";
}
