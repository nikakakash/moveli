using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Auth;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Auth.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Auth;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly MoveliDbContext _context;
    private readonly IConfiguration _configuration;

    public RefreshTokenCommandHandler(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        MoveliDbContext context,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
        _configuration = configuration;
    }

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == request.RefreshToken && !t.IsRevoked, cancellationToken);

        if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
            return Result<AuthResponse>.Failure("Invalid or expired refresh token.");

        storedToken.IsRevoked = true;

        var user = await _userManager.FindByIdAsync(storedToken.UserId.ToString());
        if (user == null)
            return Result<AuthResponse>.Failure("User not found.");

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email!, roles);
        var newRefreshTokenStr = _tokenService.GenerateRefreshToken();
        var refreshDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshDays)
        };
        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var expirationMinutes = int.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"] ?? "30");

        return Result<AuthResponse>.Success(new AuthResponse(
            accessToken,
            newRefreshTokenStr,
            DateTime.UtcNow.AddMinutes(expirationMinutes),
            new UserDto(user.Id, user.Email!, user.FirstName, user.LastName, user.PhoneNumber ?? "", user.PreferredLanguage, roles.ToList())));
    }
}
