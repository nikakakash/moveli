using System.Text;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Auth;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ResetPasswordCommandHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        const string genericError = "Invalid or expired reset link.";

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result.Failure(genericError);

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch (FormatException)
        {
            return Result.Failure(genericError);
        }

        var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
        if (result.Succeeded)
            return Result.Success();

        // Token errors are generic (don't reveal validity); surface real password-policy errors.
        if (result.Errors.Any(e => e.Code.Contains("Token", StringComparison.OrdinalIgnoreCase)))
            return Result.Failure(genericError);

        return Result.Failure(string.Join("; ", result.Errors.Select(e => e.Description)));
    }
}
