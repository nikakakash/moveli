using FluentValidation;
using MediatR;
using Moveli.Application.Common;

namespace Moveli.Application.Auth.Commands;

// Always succeeds from the caller's view (uniform response) to avoid account enumeration.
public record ForgotPasswordCommand(string Email) : IRequest<Result>;

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
