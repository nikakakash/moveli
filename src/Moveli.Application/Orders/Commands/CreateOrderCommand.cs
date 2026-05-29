using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Orders.DTOs;
using Moveli.Domain.Enums;

namespace Moveli.Application.Orders.Commands;

public record CreateOrderCommand(
    Guid UserId,
    string ShippingFullName,
    string ShippingPhoneNumber,
    string ShippingCity,
    string ShippingStreet,
    string? ShippingPostalCode,
    PaymentMethod PaymentMethod,
    string? Notes,
    string? PromoCode) : IRequest<Result<OrderDto>>;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ShippingFullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ShippingPhoneNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ShippingCity).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ShippingStreet).NotEmpty().MaximumLength(500);
    }
}
