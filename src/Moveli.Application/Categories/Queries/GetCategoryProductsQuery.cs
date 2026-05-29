using MediatR;
using Moveli.Application.Common;
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

    public GetCategoryProductsQueryHandler(IProductRepository productRepository, ICategoryRepository categoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<PagedResult<ProductListDto>>> Handle(GetCategoryProductsQuery request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        if (category == null)
            return Result<PagedResult<ProductListDto>>.Failure("Category not found.");

        var (items, totalCount) = await _productRepository.GetProductsAsync(
            request.Page, request.PageSize,
            categoryId: request.CategoryId,
            sortBy: request.SortBy,
            cancellationToken: cancellationToken);

        var dtos = items.Select(p => new ProductListDto(
            p.Id,
            p.Name.Ka,
            p.Name.En,
            p.Slug,
            p.Price,
            p.CompareAtPrice,
            p.Images.FirstOrDefault(i => i.IsMain)?.Url ?? p.Images.FirstOrDefault()?.Url,
            p.Category.Name.Ka,
            p.Category.Name.En,
            p.Brand.Name,
            p.IsActive,
            p.IsFeatured,
            p.Rating,
            p.ReviewCount,
            p.StockQuantity)).ToList();

        return Result<PagedResult<ProductListDto>>.Success(
            new PagedResult<ProductListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}
