using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Brands.Commands;

public record DeleteBrandCommand(Guid Id) : IRequest<Result>;

public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand, Result>
{
    private readonly IBrandRepository _brandRepository;
    private readonly IMemoryCache _cache;

    public DeleteBrandCommandHandler(IBrandRepository brandRepository, IMemoryCache cache)
    {
        _brandRepository = brandRepository;
        _cache = cache;
    }

    public async Task<Result> Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetByIdAsync(request.Id, cancellationToken);
        if (brand == null)
            return Result.Failure("Brand not found.");

        var productCount = await _brandRepository.GetProductCountAsync(request.Id, cancellationToken);
        if (productCount > 0)
            return Result.Failure($"Cannot delete brand that has {productCount} product(s).");

        await _brandRepository.DeleteAsync(brand, cancellationToken);
        _cache.Remove(CacheKeys.Brands);
        return Result.Success();
    }
}
