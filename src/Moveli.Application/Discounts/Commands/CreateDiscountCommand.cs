using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts.Commands;

public record CreateDiscountCommand(
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
    bool ShowCountdown) : IRequest<Result<Guid>>;

public class CreateDiscountCommandValidator : AbstractValidator<CreateDiscountCommand>
{
    public CreateDiscountCommandValidator()
    {
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

public class CreateDiscountCommandHandler : IRequestHandler<CreateDiscountCommand, Result<Guid>>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly ICacheInvalidator _invalidator;

    public CreateDiscountCommandHandler(IDiscountRepository discountRepository, ICacheInvalidator invalidator)
    {
        _discountRepository = discountRepository;
        _invalidator = invalidator;
    }

    public async Task<Result<Guid>> Handle(CreateDiscountCommand request, CancellationToken cancellationToken)
    {
        var scope = Enum.Parse<DiscountScope>(request.Scope, true);

        var discount = new Discount
        {
            Scope = scope,
            TargetId = request.TargetId,
            Percentage = request.Percentage,
            IsActive = request.IsActive,
            StartsAt = request.StartsAt?.ToUniversalTime(),
            EndsAt = request.EndsAt?.ToUniversalTime(),
            Title = new Domain.ValueObjects.LocalizedString(request.TitleKa ?? "", request.TitleEn ?? ""),
            ImageUrl = request.ImageUrl,
            Placement = Enum.Parse<DealPlacement>(request.Placement, true),
            ShowOnHome = request.ShowOnHome,
            ShowCountdown = request.ShowCountdown
        };

        discount = await _discountRepository.AddAsync(discount, cancellationToken);
        _invalidator.Invalidate(CacheInvalidatorScopes.FeaturedProducts);
        _invalidator.Invalidate(CacheInvalidatorScopes.Discounts);
        return Result<Guid>.Success(discount.Id);
    }
}
