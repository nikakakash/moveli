using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Commands;

public record UpdatePromoCodeCommand(
    Guid Id,
    string Code,
    string Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt) : IRequest<Result>;

public class UpdatePromoCodeCommandValidator : AbstractValidator<UpdatePromoCodeCommand>
{
    public UpdatePromoCodeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Type)
            .Must(t => Enum.TryParse<PromoDiscountType>(t, true, out _))
            .WithMessage("Type must be Percentage or FixedAmount.");
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.Value)
            .LessThanOrEqualTo(100)
            .When(x => Enum.TryParse<PromoDiscountType>(x.Type, true, out var t) && t == PromoDiscountType.Percentage)
            .WithMessage("Percentage value must be between 0 and 100.");
        RuleFor(x => x.EndsAt)
            .GreaterThanOrEqualTo(x => x.StartsAt!.Value)
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue)
            .WithMessage("End date must be on or after start date.");
    }
}

public class UpdatePromoCodeCommandHandler : IRequestHandler<UpdatePromoCodeCommand, Result>
{
    private readonly IPromoCodeRepository _repository;

    public UpdatePromoCodeCommandHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(UpdatePromoCodeCommand request, CancellationToken cancellationToken)
    {
        var promo = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (promo == null)
            return Result.Failure("Promo code not found.");

        var code = request.Code.Trim().ToUpperInvariant();

        var existing = await _repository.GetByCodeAsync(code, cancellationToken);
        if (existing != null && existing.Id != promo.Id)
            return Result.Failure("A promo code with this code already exists.");

        promo.Code = code;
        promo.Type = Enum.Parse<PromoDiscountType>(request.Type, true);
        promo.Value = request.Value;
        promo.IsActive = request.IsActive;
        promo.StartsAt = request.StartsAt?.ToUniversalTime();
        promo.EndsAt = request.EndsAt?.ToUniversalTime();

        await _repository.UpdateAsync(promo, cancellationToken);
        return Result.Success();
    }
}
