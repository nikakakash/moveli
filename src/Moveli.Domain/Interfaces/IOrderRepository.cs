using Moveli.Domain.Entities;
using Moveli.Domain.Enums;

namespace Moveli.Domain.Interfaces;

public interface IOrderRepository
{
    Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(List<Order> Items, int TotalCount)> GetByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<(List<Order> Items, int TotalCount)> GetAllAsync(
        int page, int pageSize,
        OrderStatus? status = null,
        DateTime? dateFrom = null, DateTime? dateTo = null,
        string? search = null,
        CancellationToken cancellationToken = default);
    Task UpdateAsync(Order order, CancellationToken cancellationToken = default);
    Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken = default);
}
