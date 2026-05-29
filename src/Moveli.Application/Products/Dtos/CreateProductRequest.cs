namespace Moveli.Application.Products.DTOs;

public record CreateProductRequest(
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
    List<string>? ImageUrls);
