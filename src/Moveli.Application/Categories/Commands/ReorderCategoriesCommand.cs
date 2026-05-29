using FluentValidation;
using MediatR;
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

    public ReorderCategoriesCommandHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result> Handle(ReorderCategoriesCommand request, CancellationToken cancellationToken)
    {
        await _categoryRepository.ReorderAsync(request.CategoryIds, cancellationToken);
        return Result.Success();
    }
}
