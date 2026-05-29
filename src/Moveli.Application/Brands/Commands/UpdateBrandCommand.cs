using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Brands.Commands;

public record UpdateBrandCommand(Guid Id, string Name, string Slug, string? LogoUrl, bool IsActive) : IRequest<Result>;

public class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200)
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug must be lowercase with hyphens only.");
    }
}

public class UpdateBrandCommandHandler : IRequestHandler<UpdateBrandCommand, Result>
{
    private readonly IBrandRepository _brandRepository;
    private readonly IMemoryCache _cache;

    public UpdateBrandCommandHandler(IBrandRepository brandRepository, IMemoryCache cache)
    {
        _brandRepository = brandRepository;
        _cache = cache;
    }

    public async Task<Result> Handle(UpdateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetByIdAsync(request.Id, cancellationToken);
        if (brand == null)
            return Result.Failure("Brand not found.");

        var slugConflict = await _brandRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (slugConflict != null && slugConflict.Id != request.Id)
            return Result.Failure("A brand with this slug already exists.");

        brand.Name = request.Name;
        brand.Slug = request.Slug;
        brand.LogoUrl = request.LogoUrl;
        brand.IsActive = request.IsActive;

        await _brandRepository.UpdateAsync(brand, cancellationToken);
        _cache.Remove(CacheKeys.Brands);
        return Result.Success();
    }
}
