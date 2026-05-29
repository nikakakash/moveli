using MediatR;
using Microsoft.AspNetCore.Identity;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Auth;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Auth.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly MoveliDbContext _context;
    private readonly IConfiguration _configuration;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        MoveliDbContext context,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _context = context;
        _configuration = configuration;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result<AuthResponse>.Failure("Invalid email or password.");

        if (await _userManager.IsLockedOutAsync(user))
            return Result<AuthResponse>.Failure("Account is locked. Please try again later.");

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!signInResult.Succeeded)
        {
            if (signInResult.IsLockedOut)
                return Result<AuthResponse>.Failure("Account is locked. Please try again later.");
            return Result<AuthResponse>.Failure("Invalid email or password.");
        }

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

        return Result<AuthResponse>.Success(new AuthResponse(
            accessToken,
            refreshTokenStr,
            DateTime.UtcNow.AddMinutes(expirationMinutes),
            new UserDto(user.Id, user.Email!, user.FirstName, user.LastName, user.PhoneNumber ?? "", user.PreferredLanguage, roles.ToList())));
    }
}
