using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using Moveli.API.Infrastructure.Services;
using Xunit;

namespace Moveli.Tests.Services;

public class CurrentUserServiceTests
{
    private static CurrentUserService Build(ClaimsPrincipal? principal)
    {
        var accessor = new Mock<IHttpContextAccessor>();
        if (principal == null)
        {
            accessor.Setup(a => a.HttpContext).Returns((HttpContext?)null);
        }
        else
        {
            accessor.Setup(a => a.HttpContext).Returns(new DefaultHttpContext { User = principal });
        }
        return new CurrentUserService(accessor.Object);
    }

    private static ClaimsPrincipal Authenticated(params Claim[] claims) =>
        new(new ClaimsIdentity(claims, authenticationType: "TestAuth"));

    [Fact]
    public void UserId_ReturnsGuid_WhenNameIdentifierPresent()
    {
        var id = Guid.NewGuid();
        var sut = Build(Authenticated(new Claim(ClaimTypes.NameIdentifier, id.ToString())));

        sut.UserId.Should().Be(id);
    }

    [Fact]
    public void UserId_ReturnsNull_WhenClaimMissing()
    {
        var sut = Build(Authenticated());

        sut.UserId.Should().BeNull();
    }

    [Fact]
    public void UserId_ReturnsNull_WhenNoHttpContext()
    {
        var sut = Build(null);

        sut.UserId.Should().BeNull();
    }

    [Fact]
    public void UserId_ReturnsNull_WhenClaimNotAGuid()
    {
        var sut = Build(Authenticated(new Claim(ClaimTypes.NameIdentifier, "not-a-guid")));

        sut.UserId.Should().BeNull();
    }

    [Fact]
    public void Email_ReturnsClaimValue()
    {
        var sut = Build(Authenticated(new Claim(ClaimTypes.Email, "user@moveli.ge")));

        sut.Email.Should().Be("user@moveli.ge");
    }

    [Fact]
    public void IsAuthenticated_ReturnsTrue_ForAuthenticatedIdentity()
    {
        var sut = Build(Authenticated(new Claim(ClaimTypes.Email, "user@moveli.ge")));

        sut.IsAuthenticated.Should().BeTrue();
    }

    [Fact]
    public void IsAuthenticated_ReturnsFalse_WhenNoHttpContext()
    {
        var sut = Build(null);

        sut.IsAuthenticated.Should().BeFalse();
    }

    [Fact]
    public void IsAdmin_ReturnsTrue_WhenAdminRolePresent()
    {
        var sut = Build(Authenticated(new Claim(ClaimTypes.Role, "Admin")));

        sut.IsAdmin.Should().BeTrue();
    }

    [Fact]
    public void IsAdmin_ReturnsFalse_WhenNotInAdminRole()
    {
        var sut = Build(Authenticated(new Claim(ClaimTypes.Role, "Customer")));

        sut.IsAdmin.Should().BeFalse();
    }
}
