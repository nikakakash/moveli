using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;

namespace Moveli.Application.Products.Commands;

public record CreateProductCommand(
    string NameKa,
    string NameEn,
    string Slug,
    string DescriptionKa,
    string DescriptionEn,
    string? SKU,
    decimal Price,
    decimal? CompareAtPrice,
    Guid CategoryId,
    Guid BrandId,
    int StockQuantity,
    bool IsActive,
    bool IsFeatured,
    List<string>? ImageUrls) : IRequest<Result<ProductDto>>;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.NameKa).NotEmpty().MaximumLength(500);
        RuleFor(x => x.NameEn).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(500)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens only.");
        RuleFor(x => x.DescriptionKa).NotEmpty();
        RuleFor(x => x.DescriptionEn).NotEmpty();
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.CompareAtPrice).GreaterThan(0).When(x => x.CompareAtPrice.HasValue);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.BrandId).NotEmpty();
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheInvalidator _invalidator;

    public CreateProductCommandHandler(IProductRepository productRepository, ICacheInvalidator invalidator)
    {
        _productRepository = productRepository;
        _invalidator = invalidator;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var existing = await _productRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existing != null)
            return Result<ProductDto>.Failure("A product with this slug already exists.");

        var product = new Product
        {
            Name = new LocalizedString(request.NameKa, request.NameEn),
            Slug = request.Slug,
            Description = new LocalizedString(request.DescriptionKa, request.DescriptionEn),
            SKU = request.SKU,
            Price = request.Price,
            CompareAtPrice = request.CompareAtPrice,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            StockQuantity = request.StockQuantity,
            IsActive = request.IsActive,
            IsFeatured = request.IsFeatured
        };

        if (request.ImageUrls is { Count: > 0 })
        {
            for (var i = 0; i < request.ImageUrls.Count; i++)
            {
                product.Images.Add(new ProductImage
                {
                    Url = request.ImageUrls[i],
                    SortOrder = i,
                    IsMain = i == 0
                });
            }
        }

        product = await _productRepository.AddAsync(product, cancellationToken);
        _invalidator.Invalidate(CacheInvalidatorScopes.FeaturedProducts);

        var dto = new ProductDto(
            product.Id,
            product.Name.Ka,
            product.Name.En,
            product.Slug,
            product.Description.Ka,
            product.Description.En,
            product.SKU,
            product.Price,
            product.CompareAtPrice,
            product.CategoryId,
            string.Empty,
            string.Empty,
            product.BrandId,
            string.Empty,
            product.Images.OrderBy(img => img.SortOrder).Select(img => new ProductImageDto(
                img.Id, img.Url, img.AltText, img.SortOrder, img.IsMain)).ToList(),
            product.StockQuantity,
            product.IsActive,
            product.IsFeatured,
            product.Rating,
            product.ReviewCount);

        return Result<ProductDto>.Success(dto);
    }
}
