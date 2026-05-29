using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Cart.Commands;

public record RemoveCartItemCommand(Guid? UserId, string? SessionId, Guid ItemId) : IRequest<Result>;

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, Result>
{
    private readonly ICartRepository _cartRepository;

    public RemoveCartItemCommandHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<Result> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
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

        await _cartRepository.RemoveItemAsync(item, cancellationToken);
        return Result.Success();
    }
}
