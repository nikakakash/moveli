using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Application.Products;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Deals.Queries;

// "Biggest discounts" grid: every active product that currently has a live discount,
// sorted by discount % desc. Discounts are scope-based and applied in memory, so we load
// candidates, price them via the snapshot, then filter/sort/page in memory (catalog is small).
public record GetDealProductsQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    decimal? MinPercentage = null) : IRequest<Result<PagedResult<ProductListDto>>>;

public class GetDealProductsQueryHandler
    : IRequestHandler<GetDealProductsQuery, Result<PagedResult<ProductListDto>>>
{
    private const int CandidateLimit = 500;
    private readonly IProductRepository _productRepository;
    private readonly IDiscountService _discountService;

    public GetDealProductsQueryHandler(IProductRepository productRepository, IDiscountService discountService)
    {
        _productRepository = productRepository;
        _discountService = discountService;
    }

    public async Task<Result<PagedResult<ProductListDto>>> Handle(GetDealProductsQuery request, CancellationToken cancellationToken)
    {
        var (items, _) = await _productRepository.GetProductsAsync(
            1, CandidateLimit, request.CategoryId, null, null, null, null, null, null, cancellationToken);

        var snapshot = await _discountService.CreateSnapshotAsync(cancellationToken);

        var discounted = items
            .Select(p =>
            {
                var (price, compareAtPrice) = snapshot.Apply(p);
                var percentage = compareAtPrice is > 0 && compareAtPrice > price
                    ? Math.Round((compareAtPrice.Value - price) / compareAtPrice.Value * 100m, 0)
                    : 0m;
                return (Product: p, Price: price, CompareAtPrice: compareAtPrice, Percentage: percentage);
            })
            .Where(x => x.Percentage > 0 && (request.MinPercentage == null || x.Percentage >= request.MinPercentage))
            .OrderByDescending(x => x.Percentage)
            .ToList();

        var pageNumber = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var total = discounted.Count;
        var page = discounted
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.Product.ToListDto(snapshot))
            .ToList();

        return Result<PagedResult<ProductListDto>>.Success(
            new PagedResult<ProductListDto>(page, total, pageNumber, pageSize));
    }
}
