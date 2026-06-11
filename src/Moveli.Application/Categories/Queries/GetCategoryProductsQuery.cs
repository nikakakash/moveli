using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Application.Products;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Categories.Queries;

public record GetCategoryProductsQuery(
    Guid CategoryId,
    int Page = 1,
    int PageSize = 20,
    string? SortBy = null) : IRequest<Result<PagedResult<ProductListDto>>>;

public class GetCategoryProductsQueryHandler : IRequestHandler<GetCategoryProductsQuery, Result<PagedResult<ProductListDto>>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IDiscountService _discountService;

    public GetCategoryProductsQueryHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IDiscountService discountService)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _discountService = discountService;
    }

    public async Task<Result<PagedResult<ProductListDto>>> Handle(GetCategoryProductsQuery request, CancellationToken cancellationToken)
    {
        if (!await _categoryRepository.ExistsAsync(request.CategoryId, cancellationToken))
            return Result<PagedResult<ProductListDto>>.Failure("Category not found.");

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _productRepository.GetProductsAsync(
            page, pageSize,
            categoryId: request.CategoryId,
            sortBy: request.SortBy,
            cancellationToken: cancellationToken);

        // Apply the live discount snapshot so category pages price products identically to
        // the main catalog and deals pages.
        var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);
        var dtos = items.Select(p => p.ToListDto(discounts)).ToList();

        return Result<PagedResult<ProductListDto>>.Success(
            new PagedResult<ProductListDto>(dtos, totalCount, page, pageSize));
    }
}
