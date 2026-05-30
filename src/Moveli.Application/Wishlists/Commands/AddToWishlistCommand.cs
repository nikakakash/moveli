using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Wishlists.Commands;

public record AddToWishlistCommand(Guid UserId, Guid ProductId) : IRequest<Result>;

public class AddToWishlistCommandHandler : IRequestHandler<AddToWishlistCommand, Result>
{
    private readonly IWishlistRepository _wishlistRepository;
    private readonly IProductRepository _productRepository;

    public AddToWishlistCommandHandler(IWishlistRepository wishlistRepository, IProductRepository productRepository)
    {
        _wishlistRepository = wishlistRepository;
        _productRepository = productRepository;
    }

    public async Task<Result> Handle(AddToWishlistCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            return Result.Failure("Product not found.");

        var existing = await _wishlistRepository.GetAsync(request.UserId, request.ProductId, cancellationToken);
        if (existing != null)
            return Result.Success();

        var wishlist = new Wishlist
        {
            UserId = request.UserId,
            ProductId = request.ProductId
        };

        try
        {
            await _wishlistRepository.AddAsync(wishlist, cancellationToken);
        }
        catch (DuplicateEntityException)
        {
            // Concurrent add of the same product — already wishlisted, so this is a no-op success.
        }

        return Result.Success();
    }
}
