using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Categories.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Categories.Queries;

public record GetCategoryTreeQuery : IRequest<Result<List<CategoryTreeDto>>>;

public class GetCategoryTreeQueryHandler : IRequestHandler<GetCategoryTreeQuery, Result<List<CategoryTreeDto>>>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMemoryCache _cache;

    public GetCategoryTreeQueryHandler(ICategoryRepository categoryRepository, IMemoryCache cache)
    {
        _categoryRepository = categoryRepository;
        _cache = cache;
    }

    public async Task<Result<List<CategoryTreeDto>>> Handle(GetCategoryTreeQuery request, CancellationToken cancellationToken)
    {
        var roots = await _cache.GetOrCreateAsync(CacheKeys.CategoryTree, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheKeys.ReferenceDataTtl;
            var categories = await _categoryRepository.GetTreeAsync(cancellationToken);
            return categories
                .Where(c => c.ParentCategoryId == null)
                .OrderBy(c => c.SortOrder)
                .Select(c => MapToTree(c))
                .ToList();
        });

        return Result<List<CategoryTreeDto>>.Success(roots!);
    }

    private static CategoryTreeDto MapToTree(Category category)
    {
        return new CategoryTreeDto(
            category.Id,
            category.Name.Ka,
            category.Name.En,
            category.Slug,
            category.ImageUrl,
            category.SortOrder,
            category.IsActive,
            category.IsComingSoon,
            category.Children
                .OrderBy(c => c.SortOrder)
                .Select(c => MapToTree(c))
                .ToList());
    }
}
