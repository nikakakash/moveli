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
        // Clamp client-supplied paging so an oversized PageSize (or negative Page) can't
        // exhaust DB/app memory on this anonymous endpoint.
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _productRepository.GetProductsAsync(
            page, pageSize,
            request.CategoryId, request.BrandId,
            request.MinPrice, request.MaxPrice,
            request.MinRating,
            request.Search, request.SortBy,
            cancellationToken);

        var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);

        var dtos = items.Select(p => p.ToListDto(discounts)).ToList();

        return Result<PagedResult<ProductListDto>>.Success(
            new PagedResult<ProductListDto>(dtos, totalCount, page, pageSize));
    }
}
