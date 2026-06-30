using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Moveli.API.Infrastructure.Auth;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Auth;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Common;
using Xunit;

namespace Moveli.Tests.Auth;

public class RegisterCommandHandlerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly MoveliDbContext _context;
    private readonly Mock<UserManager<ApplicationUser>> _userManager;
    private readonly Mock<ITokenService> _tokenService = new();
    private readonly Mock<IEmailService> _emailService = new();
    private readonly RegisterCommandHandler _sut;

    public RegisterCommandHandlerTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<MoveliDbContext>().UseSqlite(_connection).Options;
        _context = new MoveliDbContext(options);
        _context.Database.EnsureCreated();

        var store = new Mock<IUserStore<ApplicationUser>>();
        _userManager = new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
        _userManager.Setup(m => m.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser?)null);
        _userManager.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);
        _userManager.Setup(m => m.AddToRoleAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);
        _userManager.Setup(m => m.GetRolesAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(new List<string> { "Customer" });

        _tokenService.Setup(t => t.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<IList<string>>()))
            .Returns("access-token");
        _tokenService.Setup(t => t.GenerateRefreshToken()).Returns("refresh-token");

        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:RefreshTokenExpirationDays"] = "7",
            ["Jwt:AccessTokenExpirationMinutes"] = "30"
        }).Build();

        _sut = new RegisterCommandHandler(
            _userManager.Object, _tokenService.Object, _context, config, _emailService.Object,
            NullLogger<RegisterCommandHandler>.Instance);
    }

    private static RegisterCommand Command() =>
        new("new@test.com", "Password1", "Nika", "K", "555123456", "en");

    [Fact]
    public async Task Handle_SuccessfulRegistration_SendsWelcomeEmailToUser()
    {
        string? capturedTo = null;
        _emailService
            .Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, string, string, CancellationToken>((to, _, _, _) => capturedTo = to)
            .Returns(Task.CompletedTask);

        await _sut.Handle(Command(), CancellationToken.None);

        capturedTo.Should().Be("new@test.com");
    }

    [Fact]
    public async Task Handle_WhenWelcomeEmailThrows_StillSucceeds()
    {
        _emailService
            .Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("SMTP down"));

        var result = await _sut.Handle(Command(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
