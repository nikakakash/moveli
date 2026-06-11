using MediatR;
using Moveli.Application.Categories.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Categories.Queries;

public record GetCategoryBySlugQuery(string Slug) : IRequest<Result<CategoryDto>>;

public class GetCategoryBySlugQueryHandler : IRequestHandler<GetCategoryBySlugQuery, Result<CategoryDto>>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoryBySlugQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<CategoryDto>> Handle(GetCategoryBySlugQuery request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (category == null)
            return Result<CategoryDto>.Failure("Category not found.");

        return Result<CategoryDto>.Success(new CategoryDto(
            category.Id,
            category.Name.Ka,
            category.Name.En,
            category.Slug,
            category.Description?.Ka,
            category.Description?.En,
            category.ParentCategoryId,
            category.ImageUrl,
            category.SortOrder,
            category.IsActive,
            category.IsComingSoon));
    }
}
