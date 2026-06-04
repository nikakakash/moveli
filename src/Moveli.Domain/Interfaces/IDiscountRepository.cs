using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IDiscountRepository
{
    Task<(List<Discount> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<List<Discount>> GetLiveAsync(CancellationToken cancellationToken = default);
    Task<Discount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Discount> AddAsync(Discount discount, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<Discount> discounts, CancellationToken cancellationToken = default);
    Task UpdateAsync(Discount discount, CancellationToken cancellationToken = default);
    Task DeleteAsync(Discount discount, CancellationToken cancellationToken = default);
}
