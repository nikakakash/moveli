using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Brands.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Brands.Queries;

public record GetBrandsQuery : IRequest<Result<List<BrandDto>>>;

public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, Result<List<BrandDto>>>
{
    private readonly IBrandRepository _brandRepository;
    private readonly IMemoryCache _cache;

    public GetBrandsQueryHandler(IBrandRepository brandRepository, IMemoryCache cache)
    {
        _brandRepository = brandRepository;
        _cache = cache;
    }

    public async Task<Result<List<BrandDto>>> Handle(GetBrandsQuery request, CancellationToken cancellationToken)
    {
        var dtos = await _cache.GetOrCreateAsync(CacheKeys.Brands, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheKeys.ReferenceDataTtl;
            var brands = await _brandRepository.GetAllAsync(cancellationToken);
            return brands.Select(b => new BrandDto(b.Id, b.Name, b.Slug, b.LogoUrl, b.IsActive)).ToList();
        });

        return Result<List<BrandDto>>.Success(dtos!);
    }
}
