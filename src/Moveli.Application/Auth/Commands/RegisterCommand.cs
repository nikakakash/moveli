using FluentValidation;
using MediatR;
using Moveli.Application.Auth.DTOs;
using Moveli.Application.Common;

namespace Moveli.Application.Auth.Commands;

public record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? PreferredLanguage) : IRequest<Result<AuthResponse>>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PhoneNumber).NotEmpty()
            .Must(phone =>
            {
                var digits = new string(phone.Where(char.IsDigit).ToArray());
                return digits.Length == 9 || (digits.Length == 12 && digits.StartsWith("995"));
            })
            .WithMessage("Please enter a valid Georgian phone number (e.g. 5XX XXX XXX or +995 5XX XXX XXX).");
    }
}
