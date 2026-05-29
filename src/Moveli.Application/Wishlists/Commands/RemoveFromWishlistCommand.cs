using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Wishlists.Commands;

public record RemoveFromWishlistCommand(Guid UserId, Guid ProductId) : IRequest<Result>;

public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, Result>
{
    private readonly IWishlistRepository _wishlistRepository;

    public RemoveFromWishlistCommandHandler(IWishlistRepository wishlistRepository)
    {
        _wishlistRepository = wishlistRepository;
    }

    public async Task<Result> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
    {
        var item = await _wishlistRepository.GetAsync(request.UserId, request.ProductId, cancellationToken);
        if (item == null)
            return Result.Failure("Item not in wishlist.");

        await _wishlistRepository.RemoveAsync(item, cancellationToken);
        return Result.Success();
    }
}
