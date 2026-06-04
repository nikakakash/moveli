using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Products.Commands;

public record ToggleProductActiveCommand(Guid Id) : IRequest<Result>;

public class ToggleProductActiveCommandHandler : IRequestHandler<ToggleProductActiveCommand, Result>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheInvalidator _invalidator;

    public ToggleProductActiveCommandHandler(IProductRepository productRepository, ICacheInvalidator invalidator)
    {
        _productRepository = productRepository;
        _invalidator = invalidator;
    }

    public async Task<Result> Handle(ToggleProductActiveCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
            return Result.Failure("Product not found.");

        product.IsActive = !product.IsActive;
        await _productRepository.UpdateAsync(product, cancellationToken);
        _invalidator.Invalidate(CacheInvalidatorScopes.FeaturedProducts);
        return Result.Success();
    }
}
