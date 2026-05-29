namespace Moveli.Application.PromoCodes;

public record PromoValidationResult(Guid PromoCodeId, string Code, decimal DiscountAmount);
