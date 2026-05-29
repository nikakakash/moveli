namespace Moveli.Application.Brands.DTOs;

public record BrandDto(Guid Id, string Name, string Slug, string? LogoUrl, bool IsActive);

public record CreateBrandRequest(string Name, string Slug, string? LogoUrl, bool IsActive);

public record UpdateBrandRequest(string Name, string Slug, string? LogoUrl, bool IsActive);
