using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Auth;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Auth.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Auth;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly MoveliDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        MoveliDbContext context,
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<RegisterCommandHandler> logger)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return Result<AuthResponse>.Failure("A user with this email already exists.");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            PreferredLanguage = request.PreferredLanguage ?? "ka",
            EmailConfirmed = true
        };

        IdentityResult result;
        try
        {
            result = await _userManager.CreateAsync(user, request.Password);
        }
        catch (DbUpdateException ex) when (DbConcurrency.IsUniqueViolation(ex))
        {
            // Two registrations with the same email raced past the FindByEmail check.
            return Result<AuthResponse>.Failure("A user with this email already exists.");
        }
        if (!result.Succeeded)
            return Result<AuthResponse>.Failure(string.Join("; ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, "Customer");

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email!, roles);
        var refreshTokenStr = _tokenService.GenerateRefreshToken();
        var refreshDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshDays)
        };
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var expirationMinutes = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "30");

        await TrySendWelcomeAsync(user, cancellationToken);

        return Result<AuthResponse>.Success(new AuthResponse(
            accessToken,
            refreshTokenStr,
            DateTime.UtcNow.AddMinutes(expirationMinutes),
            new UserDto(user.Id, user.Email!, user.FirstName, user.LastName, user.PhoneNumber ?? "", user.PreferredLanguage, roles.ToList())));
    }

    // Best-effort welcome email — registration has already committed, so delivery must never fail it.
    private async Task TrySendWelcomeAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        try
        {
            var body = $"""
                <p>Welcome to Moveli, {user.FirstName}!</p>
                <p>Your account is ready. Browse the store and enjoy your shopping.</p>
                """;
            await _emailService.SendAsync(user.Email!, "Welcome to Moveli", body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to user {UserId}", user.Id);
        }
    }
}
