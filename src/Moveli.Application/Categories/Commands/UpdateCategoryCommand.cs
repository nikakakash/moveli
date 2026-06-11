using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;

namespace Moveli.Application.Categories.Commands;

public record UpdateCategoryCommand(
    Guid Id,
    string NameKa,
    string NameEn,
    string Slug,
    string? DescriptionKa,
    string? DescriptionEn,
    Guid? ParentCategoryId,
    string? ImageUrl,
    int SortOrder,
    bool IsActive,
    bool IsComingSoon) : IRequest<Result>;

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.NameKa).NotEmpty().MaximumLength(200);
        RuleFor(x => x.NameEn).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens only.");
    }
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMemoryCache _cache;

    public UpdateCategoryCommandHandler(ICategoryRepository categoryRepository, IMemoryCache cache)
    {
        _categoryRepository = categoryRepository;
        _cache = cache;
    }

    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
            return Result.Failure("Category not found.");

        var slugConflict = await _categoryRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (slugConflict != null && slugConflict.Id != request.Id)
            return Result.Failure("A category with this slug already exists.");

        if (request.ParentCategoryId == request.Id)
            return Result.Failure("A category cannot be its own parent.");

        category.Name = new LocalizedString(request.NameKa, request.NameEn);
        category.Slug = request.Slug;
        category.Description = request.DescriptionKa != null || request.DescriptionEn != null
            ? new LocalizedString(request.DescriptionKa ?? string.Empty, request.DescriptionEn ?? string.Empty)
            : null;
        category.ParentCategoryId = request.ParentCategoryId;
        category.ImageUrl = request.ImageUrl;
        category.SortOrder = request.SortOrder;
        category.IsActive = request.IsActive;
        category.IsComingSoon = request.IsComingSoon;

        await _categoryRepository.UpdateAsync(category, cancellationToken);
        _cache.Remove(CacheKeys.CategoryTree);
        return Result.Success();
    }
}
