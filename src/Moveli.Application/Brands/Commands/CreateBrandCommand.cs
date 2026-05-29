using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Brands.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Brands.Commands;

public record CreateBrandCommand(string Name, string Slug, string? LogoUrl, bool IsActive) : IRequest<Result<BrandDto>>;

public class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens only.");
    }
}

public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, Result<BrandDto>>
{
    private readonly IBrandRepository _brandRepository;
    private readonly IMemoryCache _cache;

    public CreateBrandCommandHandler(IBrandRepository brandRepository, IMemoryCache cache)
    {
        _brandRepository = brandRepository;
        _cache = cache;
    }

    public async Task<Result<BrandDto>> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
    {
        var existing = await _brandRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existing != null)
            return Result<BrandDto>.Failure("A brand with this slug already exists.");

        var brand = new Brand
        {
            Name = request.Name,
            Slug = request.Slug,
            LogoUrl = request.LogoUrl,
            IsActive = request.IsActive
        };

        brand = await _brandRepository.AddAsync(brand, cancellationToken);
        _cache.Remove(CacheKeys.Brands);
        return Result<BrandDto>.Success(new BrandDto(brand.Id, brand.Name, brand.Slug, brand.LogoUrl, brand.IsActive));
    }
}
