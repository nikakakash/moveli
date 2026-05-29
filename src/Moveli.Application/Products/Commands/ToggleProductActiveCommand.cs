using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Products.Commands;

public record ToggleProductActiveCommand(Guid Id) : IRequest<Result>;

public class ToggleProductActiveCommandHandler : IRequestHandler<ToggleProductActiveCommand, Result>
{
    private readonly IProductRepository _productRepository;

    public ToggleProductActiveCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result> Handle(ToggleProductActiveCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
            return Result.Failure("Product not found.");

        product.IsActive = !product.IsActive;
        await _productRepository.UpdateAsync(product, cancellationToken);
        return Result.Success();
    }
}
