using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Categories.Commands;

public record DeleteCategoryCommand(Guid Id) : IRequest<Result>;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Result>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMemoryCache _cache;

    public DeleteCategoryCommandHandler(ICategoryRepository categoryRepository, IMemoryCache cache)
    {
        _categoryRepository = categoryRepository;
        _cache = cache;
    }

    public async Task<Result> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
            return Result.Failure("Category not found.");

        var productCount = await _categoryRepository.GetProductCountAsync(request.Id, cancellationToken);
        if (productCount > 0)
            return Result.Failure($"Cannot delete category with {productCount} products. Move or delete products first.");

        await _categoryRepository.DeleteAsync(category, cancellationToken);
        _cache.Remove(CacheKeys.CategoryTree);
        return Result.Success();
    }
}
