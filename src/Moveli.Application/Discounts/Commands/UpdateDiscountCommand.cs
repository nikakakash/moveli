using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts.Commands;

public record UpdateDiscountCommand(
    Guid Id,
    string Scope,
    Guid TargetId,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    string? TitleKa,
    string? TitleEn,
    string? ImageUrl,
    string Placement,
    bool ShowOnHome,
    bool ShowCountdown) : IRequest<Result>;

public class UpdateDiscountCommandValidator : AbstractValidator<UpdateDiscountCommand>
{
    public UpdateDiscountCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Scope).Must(s => Enum.TryParse<DiscountScope>(s, true, out _))
            .WithMessage("Scope must be Product, Category or Brand.");
        RuleFor(x => x.TargetId).NotEmpty();
        RuleFor(x => x.Percentage).GreaterThan(0).LessThanOrEqualTo(100);
        RuleFor(x => x.EndsAt)
            .GreaterThanOrEqualTo(x => x.StartsAt!.Value)
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue)
            .WithMessage("End date must be after start date.");
        RuleFor(x => x.Placement).Must(p => Enum.TryParse<DealPlacement>(p, true, out _))
            .WithMessage("Placement must be None, DealsPage, FlashSale or Featured.");
    }
}

public class UpdateDiscountCommandHandler : IRequestHandler<UpdateDiscountCommand, Result>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly ICacheInvalidator _invalidator;

    public UpdateDiscountCommandHandler(IDiscountRepository discountRepository, ICacheInvalidator invalidator)
    {
        _discountRepository = discountRepository;
        _invalidator = invalidator;
    }

    public async Task<Result> Handle(UpdateDiscountCommand request, CancellationToken cancellationToken)
    {
        var discount = await _discountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (discount == null)
            return Result.Failure("Discount not found.");

        discount.Scope = Enum.Parse<DiscountScope>(request.Scope, true);
        discount.TargetId = request.TargetId;
        discount.Percentage = request.Percentage;
        discount.IsActive = request.IsActive;
        discount.StartsAt = request.StartsAt?.ToUniversalTime();
        discount.EndsAt = request.EndsAt?.ToUniversalTime();
        discount.Title = new Domain.ValueObjects.LocalizedString(request.TitleKa ?? "", request.TitleEn ?? "");
        discount.ImageUrl = request.ImageUrl;
        discount.Placement = Enum.Parse<DealPlacement>(request.Placement, true);
        discount.ShowOnHome = request.ShowOnHome;
        discount.ShowCountdown = request.ShowCountdown;

        await _discountRepository.UpdateAsync(discount, cancellationToken);
        _invalidator.Invalidate(CacheInvalidatorScopes.FeaturedProducts);
        _invalidator.Invalidate(CacheInvalidatorScopes.Discounts);
        return Result.Success();
    }
}
