using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;

namespace Moveli.Application.Discounts.Commands;

/// <summary>
/// Create one product-scoped Discount per id in <see cref="ProductIds"/>, sharing the
/// same percentage, validity window, and merchandising flags. Replaces the "submit the
/// form 50 times to apply a sale to 50 products" workflow with a single atomic call.
/// </summary>
public record BulkCreateProductDiscountsCommand(
    Guid[] ProductIds,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    string? TitleKa,
    string? TitleEn,
    string? ImageUrl,
    string Placement,
    bool ShowOnHome,
    bool ShowCountdown) : IRequest<Result<int>>;

public class BulkCreateProductDiscountsCommandValidator : AbstractValidator<BulkCreateProductDiscountsCommand>
{
    public BulkCreateProductDiscountsCommandValidator()
    {
        RuleFor(x => x.ProductIds).NotEmpty().WithMessage("Select at least one product.");
        RuleFor(x => x.ProductIds).Must(ids => ids.Length <= 500)
            .WithMessage("Maximum 500 products per bulk discount.");
        RuleFor(x => x.Percentage).GreaterThan(0).LessThanOrEqualTo(100);
        RuleFor(x => x.EndsAt)
            .GreaterThanOrEqualTo(x => x.StartsAt!.Value)
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue)
            .WithMessage("End date must be after start date.");
        RuleFor(x => x.Placement).Must(p => Enum.TryParse<DealPlacement>(p, true, out _))
            .WithMessage("Placement must be None, DealsPage, FlashSale or Featured.");
    }
}

public class BulkCreateProductDiscountsCommandHandler
    : IRequestHandler<BulkCreateProductDiscountsCommand, Result<int>>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly ICacheInvalidator _invalidator;

    public BulkCreateProductDiscountsCommandHandler(
        IDiscountRepository discountRepository,
        ICacheInvalidator invalidator)
    {
        _discountRepository = discountRepository;
        _invalidator = invalidator;
    }

    public async Task<Result<int>> Handle(BulkCreateProductDiscountsCommand request, CancellationToken cancellationToken)
    {
        // Deduplicate IDs so a sloppy client doesn't produce duplicate Discount rows.
        var uniqueIds = request.ProductIds.Distinct().ToArray();
        if (uniqueIds.Length == 0)
            return Result<int>.Failure("Select at least one product.");

        var placement = Enum.Parse<DealPlacement>(request.Placement, true);
        var startsAt = request.StartsAt?.ToUniversalTime();
        var endsAt = request.EndsAt?.ToUniversalTime();
        var title = new LocalizedString(request.TitleKa ?? "", request.TitleEn ?? "");

        var discounts = uniqueIds.Select(productId => new Discount
        {
            Scope = DiscountScope.Product,
            TargetId = productId,
            Percentage = request.Percentage,
            IsActive = request.IsActive,
            StartsAt = startsAt,
            EndsAt = endsAt,
            Title = title,
            ImageUrl = request.ImageUrl,
            Placement = placement,
            ShowOnHome = request.ShowOnHome,
            ShowCountdown = request.ShowCountdown
        }).ToList();

        await _discountRepository.AddRangeAsync(discounts, cancellationToken);
        _invalidator.Invalidate(CacheInvalidatorScopes.FeaturedProducts);
        _invalidator.Invalidate(CacheInvalidatorScopes.Discounts);
        return Result<int>.Success(discounts.Count);
    }
}
