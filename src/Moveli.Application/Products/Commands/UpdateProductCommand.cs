using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;

namespace Moveli.Application.Products.Commands;

public record UpdateProductCommand(
    Guid Id,
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
    List<string>? ImageUrls) : IRequest<Result>;

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
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

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result>
{
    private readonly IProductRepository _productRepository;

    public UpdateProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
            return Result.Failure("Product not found.");

        var slugConflict = await _productRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (slugConflict != null && slugConflict.Id != request.Id)
            return Result.Failure("A product with this slug already exists.");

        product.Name = new LocalizedString(request.NameKa, request.NameEn);
        product.Slug = request.Slug;
        product.Description = new LocalizedString(request.DescriptionKa, request.DescriptionEn);
        product.SKU = request.SKU;
        product.Price = request.Price;
        product.CompareAtPrice = request.CompareAtPrice;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.StockQuantity = request.StockQuantity;
        product.IsActive = request.IsActive;
        product.IsFeatured = request.IsFeatured;

        if (request.ImageUrls != null)
        {
            product.Images.Clear();
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

        try
        {
            await _productRepository.UpdateAsync(product, cancellationToken);
        }
        catch (ConcurrencyConflictException ex)
        {
            return Result.Failure(ex.Message);
        }

        return Result.Success();
    }
}
