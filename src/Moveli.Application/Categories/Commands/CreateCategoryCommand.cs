using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Categories.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;

namespace Moveli.Application.Categories.Commands;

public record CreateCategoryCommand(
    string NameKa,
    string NameEn,
    string Slug,
    string? DescriptionKa,
    string? DescriptionEn,
    Guid? ParentCategoryId,
    string? ImageUrl,
    int SortOrder,
    bool IsActive,
    bool IsComingSoon) : IRequest<Result<CategoryDto>>;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.NameKa).NotEmpty().MaximumLength(200);
        RuleFor(x => x.NameEn).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens only.");
    }
}

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMemoryCache _cache;

    public CreateCategoryCommandHandler(ICategoryRepository categoryRepository, IMemoryCache cache)
    {
        _categoryRepository = categoryRepository;
        _cache = cache;
    }

    public async Task<Result<CategoryDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var existing = await _categoryRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existing != null)
            return Result<CategoryDto>.Failure("A category with this slug already exists.");

        if (request.ParentCategoryId.HasValue)
        {
            var parent = await _categoryRepository.GetByIdAsync(request.ParentCategoryId.Value, cancellationToken);
            if (parent == null)
                return Result<CategoryDto>.Failure("Parent category not found.");
        }

        var category = new Category
        {
            Name = new LocalizedString(request.NameKa, request.NameEn),
            Slug = request.Slug,
            Description = request.DescriptionKa != null || request.DescriptionEn != null
                ? new LocalizedString(request.DescriptionKa ?? string.Empty, request.DescriptionEn ?? string.Empty)
                : null,
            ParentCategoryId = request.ParentCategoryId,
            ImageUrl = request.ImageUrl,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            IsComingSoon = request.IsComingSoon
        };

        category = await _categoryRepository.AddAsync(category, cancellationToken);
        _cache.Remove(CacheKeys.CategoryTree);

        return Result<CategoryDto>.Success(new CategoryDto(
            category.Id, category.Name.Ka, category.Name.En, category.Slug,
            category.Description?.Ka, category.Description?.En,
            category.ParentCategoryId, category.ImageUrl, category.SortOrder, category.IsActive, category.IsComingSoon));
    }
}
