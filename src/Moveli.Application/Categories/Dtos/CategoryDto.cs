namespace Moveli.Application.Categories.DTOs;

public record CategoryDto(
    Guid Id,
    string NameKa,
    string NameEn,
    string Slug,
    string? DescriptionKa,
    string? DescriptionEn,
    Guid? ParentCategoryId,
    string? ImageUrl,
    int SortOrder,
    bool IsActive);

public record CategoryTreeDto(
    Guid Id,
    string NameKa,
    string NameEn,
    string Slug,
    string? ImageUrl,
    int SortOrder,
    bool IsActive,
    List<CategoryTreeDto> Children);

public record CreateCategoryRequest(
    string NameKa,
    string NameEn,
    string Slug,
    string? DescriptionKa,
    string? DescriptionEn,
    Guid? ParentCategoryId,
    string? ImageUrl,
    int SortOrder,
    bool IsActive);

public record UpdateCategoryRequest(
    string NameKa,
    string NameEn,
    string Slug,
    string? DescriptionKa,
    string? DescriptionEn,
    Guid? ParentCategoryId,
    string? ImageUrl,
    int SortOrder,
    bool IsActive);
