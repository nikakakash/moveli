using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Cart.Commands;

public record AddCartItemCommand(Guid? UserId, string? SessionId, Guid ProductId, int Quantity = 1) : IRequest<Result>;

public class AddCartItemCommandValidator : AbstractValidator<AddCartItemCommand>
{
    public AddCartItemCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}

public class AddCartItemCommandHandler : IRequestHandler<AddCartItemCommand, Result>
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;
    private readonly IDiscountService _discountService;

    public AddCartItemCommandHandler(
        ICartRepository cartRepository,
        IProductRepository productRepository,
        IDiscountService discountService)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _discountService = discountService;
    }

    public async Task<Result> Handle(AddCartItemCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null || !product.IsActive)
            return Result.Failure("Product not found or unavailable.");

        // Capture the discounted price so checkout/order totals reflect the discount.
        var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);
        var (effectivePrice, _) = discounts.Apply(product);

        Domain.Entities.Cart? cart = null;

        if (request.UserId.HasValue)
            cart = await _cartRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken);
        else if (!string.IsNullOrEmpty(request.SessionId))
            cart = await _cartRepository.GetBySessionIdAsync(request.SessionId, cancellationToken);

        if (cart == null)
        {
            cart = new Domain.Entities.Cart
            {
                UserId = request.UserId,
                SessionId = request.SessionId
            };
            cart = await _cartRepository.CreateAsync(cart, cancellationToken);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        var totalQuantity = request.Quantity + (existingItem?.Quantity ?? 0);

        if (product.StockQuantity < totalQuantity)
            return Result.Failure("Not enough stock available.");

        if (existingItem != null)
        {
            existingItem.Quantity = totalQuantity;
            existingItem.UnitPrice = effectivePrice;
            await _cartRepository.UpdateItemAsync(existingItem, cancellationToken);
        }
        else
        {
            var item = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                UnitPrice = effectivePrice
            };
            await _cartRepository.AddItemAsync(item, cancellationToken);
        }

        return Result.Success();
    }
}
