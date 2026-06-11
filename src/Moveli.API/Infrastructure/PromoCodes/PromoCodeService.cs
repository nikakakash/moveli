using Moveli.Application.Common;
using Moveli.Application.PromoCodes;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.PromoCodes;

public class PromoCodeService : IPromoCodeService
{
    private readonly IPromoCodeRepository _repository;

    public PromoCodeService(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PromoValidationResult>> ValidateAsync(
        string code, decimal subtotal, Guid userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<PromoValidationResult>.Failure("Promo code is invalid.");

        var promo = await _repository.GetByCodeAsync(code, cancellationToken);
        if (promo == null)
            return Result<PromoValidationResult>.Failure("Promo code is invalid.");

        if (!promo.IsLive(DateTime.UtcNow))
            return Result<PromoValidationResult>.Failure("This promo code is expired or inactive.");

        if (await _repository.HasUserRedeemedAsync(promo.Id, userId, cancellationToken))
            return Result<PromoValidationResult>.Failure("You have already used this promo code.");

        // Best-effort early rejection when the global cap is already reached. The authoritative,
        // race-free enforcement happens atomically at redemption time in the order handler.
        if (promo.MaxRedemptions is int cap
            && await _repository.GetRedemptionCountAsync(promo.Id, cancellationToken) >= cap)
            return Result<PromoValidationResult>.Failure("This promo code is no longer available.");

        var discount = promo.ComputeDiscount(subtotal);
        return Result<PromoValidationResult>.Success(
            new PromoValidationResult(promo.Id, promo.Code, discount, promo.MaxRedemptions));
    }
}
