using MediatR;
using Moveli.Application.Brands.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Brands.Queries;

public record GetBrandBySlugQuery(string Slug) : IRequest<Result<BrandDto>>;

public class GetBrandBySlugQueryHandler : IRequestHandler<GetBrandBySlugQuery, Result<BrandDto>>
{
    private readonly IBrandRepository _brandRepository;

    public GetBrandBySlugQueryHandler(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<Result<BrandDto>> Handle(GetBrandBySlugQuery request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (brand == null)
            return Result<BrandDto>.Failure("Brand not found.");

        return Result<BrandDto>.Success(new BrandDto(brand.Id, brand.Name, brand.Slug, brand.LogoUrl, brand.IsActive));
    }
}
