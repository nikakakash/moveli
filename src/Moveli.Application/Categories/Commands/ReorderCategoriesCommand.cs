using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Categories.Commands;

public record ReorderCategoriesCommand(List<Guid> CategoryIds) : IRequest<Result>;

public class ReorderCategoriesCommandValidator : AbstractValidator<ReorderCategoriesCommand>
{
    public ReorderCategoriesCommandValidator()
    {
        RuleFor(x => x.CategoryIds).NotEmpty();
    }
}

public class ReorderCategoriesCommandHandler : IRequestHandler<ReorderCategoriesCommand, Result>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMemoryCache _cache;

    public ReorderCategoriesCommandHandler(ICategoryRepository categoryRepository, IMemoryCache cache)
    {
        _categoryRepository = categoryRepository;
        _cache = cache;
    }

    public async Task<Result> Handle(ReorderCategoriesCommand request, CancellationToken cancellationToken)
    {
        await _categoryRepository.ReorderAsync(request.CategoryIds, cancellationToken);
        // Reordering changes SortOrder, which drives the cached category tree ordering.
        _cache.Remove(CacheKeys.CategoryTree);
        return Result.Success();
    }
}
