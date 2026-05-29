using Moveli.Application.Common;

namespace Moveli.Application.PromoCodes;

public interface IPromoCodeService
{
    Task<Result<PromoValidationResult>> ValidateAsync(
        string code, decimal subtotal, Guid userId, CancellationToken cancellationToken = default);
}
