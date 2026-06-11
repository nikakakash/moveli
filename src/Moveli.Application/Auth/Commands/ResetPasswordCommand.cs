using FluentValidation;
using MediatR;
using Moveli.Application.Common;

namespace Moveli.Application.Auth.Commands;

public record ResetPasswordCommand(string Email, string Token, string NewPassword) : IRequest<Result>;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
    }
}
