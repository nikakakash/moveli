using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IPromoCodeRepository
{
    Task<(List<PromoCode> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<PromoCode?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PromoCode?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task AddAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task UpdateAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task DeleteAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task<bool> HasUserRedeemedAsync(Guid promoCodeId, Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetRedemptionCountAsync(Guid promoCodeId, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, int>> GetRedemptionCountsAsync(CancellationToken cancellationToken = default);
}
