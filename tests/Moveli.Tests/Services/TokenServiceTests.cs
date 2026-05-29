using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moveli.API.Infrastructure.Services;
using Xunit;

namespace Moveli.Tests.Services;

public class TokenServiceTests
{
    private readonly TokenService _sut;

    public TokenServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "super-secret-test-signing-key-of-32+chars!!",
                ["Jwt:Issuer"] = "moveli-test",
                ["Jwt:Audience"] = "moveli-test-aud",
                ["Jwt:AccessTokenExpirationMinutes"] = "30"
            })
            .Build();

        _sut = new TokenService(config);
    }

    [Fact]
    public void GenerateAccessToken_EmbedsUserIdEmailAndRoles()
    {
        var userId = Guid.NewGuid();

        var token = _sut.GenerateAccessToken(userId, "user@moveli.ge", new[] { "Customer", "Admin" });

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        jwt.Claims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier && c.Value == userId.ToString());
        jwt.Claims.Should().Contain(c => c.Type == ClaimTypes.Email && c.Value == "user@moveli.ge");
        jwt.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value)
            .Should().BeEquivalentTo("Customer", "Admin");
    }

    [Fact]
    public void GenerateAccessToken_SetsIssuerAudienceAndExpiry()
    {
        var token = _sut.GenerateAccessToken(Guid.NewGuid(), "a@b.ge", Array.Empty<string>());

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        jwt.Issuer.Should().Be("moveli-test");
        jwt.Audiences.Should().Contain("moveli-test-aud");
        jwt.ValidTo.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(30), TimeSpan.FromMinutes(1));
    }

    [Fact]
    public void GenerateAccessToken_IncludesUniqueJti()
    {
        var t1 = new JwtSecurityTokenHandler().ReadJwtToken(_sut.GenerateAccessToken(Guid.NewGuid(), "a@b.ge", Array.Empty<string>()));
        var t2 = new JwtSecurityTokenHandler().ReadJwtToken(_sut.GenerateAccessToken(Guid.NewGuid(), "a@b.ge", Array.Empty<string>()));

        var jti1 = t1.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Jti).Value;
        var jti2 = t2.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Jti).Value;
        jti1.Should().NotBe(jti2);
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsUniqueBase64Values()
    {
        var a = _sut.GenerateRefreshToken();
        var b = _sut.GenerateRefreshToken();

        a.Should().NotBeNullOrWhiteSpace();
        a.Should().NotBe(b);
        var act = () => Convert.FromBase64String(a);
        act.Should().NotThrow();
    }
}
