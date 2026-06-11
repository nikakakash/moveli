using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Auth.DTOs;
using Moveli.Application.Auth.Queries;
using Moveli.Application.Common;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    // The refresh token lives in an HttpOnly cookie so it is never readable by JavaScript
    // (XSS can't exfiltrate it). Scoped to /api/auth so it's only sent to the auth endpoints.
    private const string RefreshCookieName = "moveli_refresh";
    private const string RefreshCookiePath = "/api/auth";

    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;

    public AuthController(IMediator mediator, IConfiguration configuration)
    {
        _mediator = mediator;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterCommand(
            request.Email, request.Password,
            request.FirstName, request.LastName,
            request.PhoneNumber, request.PreferredLanguage);

        var result = await _mediator.Send(command);
        return AuthResult(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var command = new LoginCommand(request.Email, request.Password);
        var result = await _mediator.Send(command);
        return AuthResult(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest? request = null)
    {
        // Prefer the HttpOnly cookie; fall back to a body token for non-browser clients.
        var token = Request.Cookies[RefreshCookieName];
        if (string.IsNullOrEmpty(token))
            token = request?.RefreshToken;
        if (string.IsNullOrEmpty(token))
            return Unauthorized(new { error = "Missing refresh token." });

        var result = await _mediator.Send(new RefreshTokenCommand(token));
        if (!result.IsSuccess)
        {
            ClearRefreshCookie();
            return Unauthorized(new { error = result.Error });
        }

        SetRefreshCookie(result.Value!.RefreshToken);
        return Ok(result.Value with { RefreshToken = "" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        // Uniform 200 regardless of whether the email exists (no account enumeration).
        await _mediator.Send(new ForgotPasswordCommand(request.Email));
        return Ok(new { message = "If an account exists for that email, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _mediator.Send(new ResetPasswordCommand(request.Email, request.Token, request.NewPassword));
        return result.IsSuccess ? Ok(new { message = "Password updated." }) : BadRequest(new { error = result.Error });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies[RefreshCookieName];
        if (!string.IsNullOrEmpty(token))
            await _mediator.Send(new RevokeRefreshTokenCommand(token));
        ClearRefreshCookie();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    [DisableRateLimiting]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await _mediator.Send(new GetCurrentUserQuery());
        return result.IsSuccess ? Ok(result.Value) : Unauthorized(new { error = result.Error });
    }

    // Sets the refresh cookie and strips the token from the JSON body so it never reaches JS.
    private IActionResult AuthResult(Result<AuthResponse> result)
    {
        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        SetRefreshCookie(result.Value!.RefreshToken);
        return Ok(result.Value with { RefreshToken = "" });
    }

    private void SetRefreshCookie(string token)
    {
        var days = int.TryParse(_configuration["Jwt:RefreshTokenExpirationDays"], out var d) ? d : 7;
        Response.Cookies.Append(RefreshCookieName, token, BuildCookieOptions(TimeSpan.FromDays(days)));
    }

    private void ClearRefreshCookie()
    {
        var options = BuildCookieOptions(null);
        options.Expires = DateTimeOffset.UnixEpoch;
        Response.Cookies.Append(RefreshCookieName, "", options);
    }

    // SameSite=None+Secure so the cookie works when the frontend is on a different origin than
    // the API. State-changing endpoints authenticate via the Bearer header (not this cookie), so
    // SameSite=None does not open a CSRF vector on them.
    private static CookieOptions BuildCookieOptions(TimeSpan? maxAge) => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None,
        Path = RefreshCookiePath,
        MaxAge = maxAge
    };
}
