using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly MoveliDbContext _context;

    public OrderRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
        return order;
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<(List<Order> Items, int TotalCount)> GetByUserIdAsync(
        Guid userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(List<Order> Items, int TotalCount)> GetAllAsync(
        int page, int pageSize,
        OrderStatus? status = null,
        DateTime? dateFrom = null, DateTime? dateTo = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (dateFrom.HasValue)
            query = query.Where(o => o.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(o => o.CreatedAt <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(o => o.OrderNumber.Contains(search));

        query = query.OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken = default)
    {
        // Use raw SQL with PostgreSQL advisory lock to prevent race conditions
        var year = DateTime.UtcNow.ToString("yy");
        var prefix = $"MV-{year}";

        var result = await _context.Database
            .SqlQueryRaw<int>(
                @"SELECT COALESCE(MAX(CAST(SUBSTRING(""OrderNumber"" FROM LENGTH({0}) + 1) AS INTEGER)), 0) + 1 AS ""Value""
                  FROM ""Orders"" WHERE ""OrderNumber"" LIKE {0} || '%'",
                prefix)
            .FirstOrDefaultAsync(cancellationToken);

        return $"{prefix}{result:D4}";
    }
}
