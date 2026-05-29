namespace Moveli.Application.Products.DTOs;

public record ProductDto(
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
    string CategoryNameKa,
    string CategoryNameEn,
    Guid BrandId,
    string BrandName,
    List<ProductImageDto> Images,
    int StockQuantity,
    bool IsActive,
    bool IsFeatured,
    decimal Rating,
    int ReviewCount);

public record ProductListDto(
    Guid Id,
    string NameKa,
    string NameEn,
    string Slug,
    decimal Price,
    decimal? CompareAtPrice,
    string? MainImageUrl,
    string CategoryNameKa,
    string CategoryNameEn,
    string BrandName,
    bool IsActive,
    bool IsFeatured,
    decimal Rating,
    int ReviewCount,
    int StockQuantity);

public record ProductImageDto(
    Guid Id,
    string Url,
    string? AltText,
    int SortOrder,
    bool IsMain);
