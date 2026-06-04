using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Products.Commands;

public record DeleteProductCommand(Guid Id) : IRequest<Result>;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheInvalidator _invalidator;

    public DeleteProductCommandHandler(IProductRepository productRepository, ICacheInvalidator invalidator)
    {
        _productRepository = productRepository;
        _invalidator = invalidator;
    }

    public async Task<Result> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
            return Result.Failure("Product not found.");

        await _productRepository.DeleteAsync(product, cancellationToken);
        _invalidator.Invalidate(CacheInvalidatorScopes.FeaturedProducts);
        return Result.Success();
    }
}
