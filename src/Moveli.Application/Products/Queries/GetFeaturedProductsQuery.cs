using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Products.Queries;

public record GetFeaturedProductsQuery(int Count = 10) : IRequest<Result<List<ProductListDto>>>;

public class GetFeaturedProductsQueryHandler : IRequestHandler<GetFeaturedProductsQuery, Result<List<ProductListDto>>>
{
    private readonly IProductRepository _productRepository;
    private readonly IDiscountService _discountService;
    private readonly IMemoryCache _cache;
    private readonly ICacheInvalidator _invalidator;

    public GetFeaturedProductsQueryHandler(
        IProductRepository productRepository,
        IDiscountService discountService,
        IMemoryCache cache,
        ICacheInvalidator invalidator)
    {
        _productRepository = productRepository;
        _discountService = discountService;
        _cache = cache;
        _invalidator = invalidator;
    }

    public async Task<Result<List<ProductListDto>>> Handle(GetFeaturedProductsQuery request, CancellationToken cancellationToken)
    {
        // Clamp the client-supplied count so it can't load a huge result set or spray the
        // cache with many distinct count-keyed entries.
        var count = Math.Clamp(request.Count, 1, 50);

        var dtos = await _cache.GetOrCreateAsync(CacheKeys.FeaturedProducts(count), async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheKeys.FeaturedProductsTtl;
            // Lets product/discount mutations evict every count-keyed featured entry at once.
            entry.AddExpirationToken(_invalidator.GetChangeToken(CacheInvalidatorScopes.FeaturedProducts));

            var products = await _productRepository.GetFeaturedAsync(count, cancellationToken);
            var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);

            return products.Select(p => p.ToListDto(discounts)).ToList();
        });

        return Result<List<ProductListDto>>.Success(dtos!);
    }
}
