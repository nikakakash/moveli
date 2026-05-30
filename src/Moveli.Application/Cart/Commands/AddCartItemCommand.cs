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

        async Task<Result> MergeIntoExistingAsync(CartItem existing)
        {
            var merged = existing.Quantity + request.Quantity;
            if (product.StockQuantity < merged)
                return Result.Failure("Not enough stock available.");
            existing.Quantity = merged;
            existing.UnitPrice = effectivePrice;
            await _cartRepository.UpdateItemAsync(existing, cancellationToken);
            return Result.Success();
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (existingItem != null)
            return await MergeIntoExistingAsync(existingItem);

        if (product.StockQuantity < request.Quantity)
            return Result.Failure("Not enough stock available.");

        try
        {
            await _cartRepository.AddItemAsync(new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                UnitPrice = effectivePrice
            }, cancellationToken);
            return Result.Success();
        }
        catch (DuplicateEntityException)
        {
            // A concurrent request inserted this product first — reload and merge into that row.
            var refreshed = request.UserId.HasValue
                ? await _cartRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken)
                : await _cartRepository.GetBySessionIdAsync(request.SessionId!, cancellationToken);
            var now = refreshed?.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (now == null)
                return Result.Failure("Could not add item to cart. Please try again.");
            return await MergeIntoExistingAsync(now);
        }
    }
}
