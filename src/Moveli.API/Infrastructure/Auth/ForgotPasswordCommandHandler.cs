using System.Text;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Auth;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ForgotPasswordCommandHandler> _logger;

    public ForgotPasswordCommandHandler(
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<ForgotPasswordCommandHandler> logger)
    {
        _userManager = userManager;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        // Only generate + send when the account exists, but ALWAYS return success so the response
        // is identical whether or not the email is registered (no account enumeration).
        if (user != null)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var frontendBase = (_configuration["Frontend:BaseUrl"] ?? "https://moveli.ge").TrimEnd('/');
            var resetLink = $"{frontendBase}/reset-password?email={Uri.EscapeDataString(request.Email)}&token={encodedToken}";

            var body = $"""
                <p>We received a request to reset your Moveli password.</p>
                <p><a href="{resetLink}">Reset your password</a></p>
                <p>If you didn't request this, you can safely ignore this email. The link expires shortly.</p>
                """;

            try
            {
                await _emailService.SendAsync(request.Email, "Reset your Moveli password", body, cancellationToken);
            }
            catch (Exception ex)
            {
                // Don't leak failure to the caller; log for ops.
                _logger.LogError(ex, "Failed to send password reset email to {Email}", request.Email);
            }
        }

        return Result.Success();
    }
}
