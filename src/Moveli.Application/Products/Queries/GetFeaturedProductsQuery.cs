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

    public GetFeaturedProductsQueryHandler(
        IProductRepository productRepository,
        IDiscountService discountService,
        IMemoryCache cache)
    {
        _productRepository = productRepository;
        _discountService = discountService;
        _cache = cache;
    }

    public async Task<Result<List<ProductListDto>>> Handle(GetFeaturedProductsQuery request, CancellationToken cancellationToken)
    {
        var dtos = await _cache.GetOrCreateAsync(CacheKeys.FeaturedProducts(request.Count), async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheKeys.FeaturedProductsTtl;

            var products = await _productRepository.GetFeaturedAsync(request.Count, cancellationToken);
            var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);

            return products.Select(p =>
            {
                var (price, compareAtPrice) = discounts.Apply(p);
                return new ProductListDto(
                    p.Id,
                    p.Name.Ka,
                    p.Name.En,
                    p.Slug,
                    price,
                    compareAtPrice,
                    p.Images.FirstOrDefault(i => i.IsMain)?.Url ?? p.Images.FirstOrDefault()?.Url,
                    p.Category.Name.Ka,
                    p.Category.Name.En,
                    p.Brand.Name,
                    p.IsActive,
                    p.IsFeatured,
                    p.Rating,
                    p.ReviewCount,
                    p.StockQuantity);
            }).ToList();
        });

        return Result<List<ProductListDto>>.Success(dtos!);
    }
}
