namespace Moveli.Application.Auth;

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string email, IList<string> roles);
    string GenerateRefreshToken();
}
