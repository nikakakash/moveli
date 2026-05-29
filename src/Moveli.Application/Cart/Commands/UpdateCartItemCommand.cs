using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Cart.Commands;

public record UpdateCartItemCommand(Guid? UserId, string? SessionId, Guid ItemId, int Quantity) : IRequest<Result>;

public class UpdateCartItemCommandValidator : AbstractValidator<UpdateCartItemCommand>
{
    public UpdateCartItemCommandValidator()
    {
        RuleFor(x => x.ItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, Result>
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;

    public UpdateCartItemCommandHandler(ICartRepository cartRepository, IProductRepository productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }

    public async Task<Result> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        Domain.Entities.Cart? cart = null;

        if (request.UserId.HasValue)
            cart = await _cartRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken);
        else if (!string.IsNullOrEmpty(request.SessionId))
            cart = await _cartRepository.GetBySessionIdAsync(request.SessionId, cancellationToken);

        if (cart == null)
            return Result.Failure("Cart not found.");

        var item = cart.Items.FirstOrDefault(i => i.Id == request.ItemId);
        if (item == null)
            return Result.Failure("Cart item not found.");

        var product = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
        if (product == null || !product.IsActive)
            return Result.Failure("Product is no longer available.");

        if (product.StockQuantity < request.Quantity)
            return Result.Failure("Not enough stock available.");

        item.Quantity = request.Quantity;
        await _cartRepository.UpdateItemAsync(item, cancellationToken);
        return Result.Success();
    }
}
