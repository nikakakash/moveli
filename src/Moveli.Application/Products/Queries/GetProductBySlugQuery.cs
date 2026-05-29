using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Products.Queries;

public record GetProductBySlugQuery(string Slug) : IRequest<Result<ProductDto>>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IDiscountService _discountService;

    public GetProductBySlugQueryHandler(IProductRepository productRepository, IDiscountService discountService)
    {
        _productRepository = productRepository;
        _discountService = discountService;
    }

    public async Task<Result<ProductDto>> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetBySlugAsync(request.Slug, cancellationToken);

        if (product == null)
            return Result<ProductDto>.Failure("Product not found.");

        var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);
        var (price, compareAtPrice) = discounts.Apply(product);

        var dto = new ProductDto(
            product.Id,
            product.Name.Ka,
            product.Name.En,
            product.Slug,
            product.Description.Ka,
            product.Description.En,
            product.SKU,
            price,
            compareAtPrice,
            product.CategoryId,
            product.Category.Name.Ka,
            product.Category.Name.En,
            product.BrandId,
            product.Brand.Name,
            product.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto(
                i.Id, i.Url, i.AltText, i.SortOrder, i.IsMain)).ToList(),
            product.StockQuantity,
            product.IsActive,
            product.IsFeatured,
            product.Rating,
            product.ReviewCount);

        return Result<ProductDto>.Success(dto);
    }
}
