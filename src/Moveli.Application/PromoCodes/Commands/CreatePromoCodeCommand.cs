using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Commands;

public record CreatePromoCodeCommand(
    string Code,
    string Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    int? MaxRedemptions) : IRequest<Result<Guid>>;

public class CreatePromoCodeCommandValidator : AbstractValidator<CreatePromoCodeCommand>
{
    public CreatePromoCodeCommandValidator()
    {
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
        RuleFor(x => x.MaxRedemptions)
            .GreaterThan(0)
            .When(x => x.MaxRedemptions.HasValue)
            .WithMessage("Max redemptions must be greater than 0.");
    }
}

public class CreatePromoCodeCommandHandler : IRequestHandler<CreatePromoCodeCommand, Result<Guid>>
{
    private readonly IPromoCodeRepository _repository;

    public CreatePromoCodeCommandHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreatePromoCodeCommand request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();

        var existing = await _repository.GetByCodeAsync(code, cancellationToken);
        if (existing != null)
            return Result<Guid>.Failure("A promo code with this code already exists.");

        var promo = new PromoCode
        {
            Code = code,
            Type = Enum.Parse<PromoDiscountType>(request.Type, true),
            Value = request.Value,
            IsActive = request.IsActive,
            StartsAt = request.StartsAt?.ToUniversalTime(),
            EndsAt = request.EndsAt?.ToUniversalTime(),
            MaxRedemptions = request.MaxRedemptions
        };

        await _repository.AddAsync(promo, cancellationToken);
        return Result<Guid>.Success(promo.Id);
    }
}
