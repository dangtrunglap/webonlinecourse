using Microsoft.AspNetCore.Mvc;
using OnlineCoursePlatform.API.Application.DTOs.Auth;
using OnlineCoursePlatform.API.Application.Services;
using System.Threading.Tasks;

namespace OnlineCoursePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (!dto.ConsentGiven)
            {
                return BadRequest(new { Message = "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo vệ dữ liệu cá nhân (NĐ 13/2023/NĐ-CP)." });
            }

            var result = await _authService.RegisterAsync(dto);
            if (result == null)
                return BadRequest(new { Message = "Đăng ký thất bại. Email có thể đã tồn tại hoặc mật khẩu chưa đủ 8 ký tự." });

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Unauthorized(new { Message = "Email hoặc mật khẩu không chính xác." });

            return Ok(result);
        }
    }
}
