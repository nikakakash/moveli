using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Products.DTOs;
using Moveli.Application.Wishlists.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Wishlists.Queries;

public record GetWishlistQuery(Guid UserId) : IRequest<Result<List<WishlistItemDto>>>;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, Result<List<WishlistItemDto>>>
{
    private readonly IWishlistRepository _wishlistRepository;

    public GetWishlistQueryHandler(IWishlistRepository wishlistRepository)
    {
        _wishlistRepository = wishlistRepository;
    }

    public async Task<Result<List<WishlistItemDto>>> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
    {
        var items = await _wishlistRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        var dtos = items.Select(w => new WishlistItemDto(
            w.Id,
            w.ProductId,
            new ProductListDto(
                w.Product.Id,
                w.Product.Name.Ka,
                w.Product.Name.En,
                w.Product.Slug,
                w.Product.Price,
                w.Product.CompareAtPrice,
                w.Product.Images.FirstOrDefault(i => i.IsMain)?.Url ?? w.Product.Images.FirstOrDefault()?.Url,
                w.Product.Category.Name.Ka,
                w.Product.Category.Name.En,
                w.Product.Brand.Name,
                w.Product.IsActive,
                w.Product.IsFeatured,
                w.Product.Rating,
                w.Product.ReviewCount,
                w.Product.StockQuantity),
            w.AddedAt)).ToList();

        return Result<List<WishlistItemDto>>.Success(dtos);
    }
}
