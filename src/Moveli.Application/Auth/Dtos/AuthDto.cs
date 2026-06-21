namespace Moveli.Application.Auth.DTOs;

public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt, UserDto User);

public record UserDto(Guid Id, string Email, string FirstName, string LastName, string PhoneNumber, string PreferredLanguage, List<string> Roles);

public record RegisterRequest(string Email, string Password, string FirstName, string LastName, string PhoneNumber, string? PreferredLanguage);

public record LoginRequest(string Email, string Password);

// RefreshToken is optional: browser clients send it via the HttpOnly cookie with an empty
// JSON body, so a non-nullable (implicitly required) property would 400 before the controller's
// cookie fallback runs. Only non-browser clients supply it in the body.
public record RefreshTokenRequest(string? RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Email, string Token, string NewPassword);
