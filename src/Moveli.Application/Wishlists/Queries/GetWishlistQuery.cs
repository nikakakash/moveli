using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Application.Products;
using Moveli.Application.Wishlists.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Wishlists.Queries;

public record GetWishlistQuery(Guid UserId) : IRequest<Result<List<WishlistItemDto>>>;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, Result<List<WishlistItemDto>>>
{
    private readonly IWishlistRepository _wishlistRepository;
    private readonly IDiscountService _discountService;

    public GetWishlistQueryHandler(IWishlistRepository wishlistRepository, IDiscountService discountService)
    {
        _wishlistRepository = wishlistRepository;
        _discountService = discountService;
    }

    public async Task<Result<List<WishlistItemDto>>> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
    {
        var items = await _wishlistRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        // Price wishlist items through the live discount snapshot, same as every other listing.
        var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);

        var dtos = items.Select(w => new WishlistItemDto(
            w.Id,
            w.ProductId,
            w.Product.ToListDto(discounts),
            w.AddedAt)).ToList();

        return Result<List<WishlistItemDto>>.Success(dtos);
    }
}
