using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Products.Queries;

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    Guid? BrandId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    decimal? MinRating = null,
    string? Search = null,
    string? SortBy = null) : IRequest<Result<PagedResult<ProductListDto>>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<PagedResult<ProductListDto>>>
{
    private readonly IProductRepository _productRepository;
    private readonly IDiscountService _discountService;

    public GetProductsQueryHandler(IProductRepository productRepository, IDiscountService discountService)
    {
        _productRepository = productRepository;
        _discountService = discountService;
    }

    public async Task<Result<PagedResult<ProductListDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _productRepository.GetProductsAsync(
            request.Page, request.PageSize,
            request.CategoryId, request.BrandId,
            request.MinPrice, request.MaxPrice,
            request.MinRating,
            request.Search, request.SortBy,
            cancellationToken);

        var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);

        var dtos = items.Select(p =>
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

        return Result<PagedResult<ProductListDto>>.Success(
            new PagedResult<ProductListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}
