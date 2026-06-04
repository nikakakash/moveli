using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class DiscountRepository : IDiscountRepository
{
    private readonly MoveliDbContext _context;

    public DiscountRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Discount> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Discounts.OrderByDescending(d => d.CreatedAt);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<List<Discount>> GetLiveAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _context.Discounts
            .Where(d => d.IsActive
                && (d.StartsAt == null || d.StartsAt <= now)
                && (d.EndsAt == null || d.EndsAt >= now))
            .ToListAsync(cancellationToken);
    }

    public async Task<Discount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Discounts.FindAsync([id], cancellationToken);
    }

    public async Task<Discount> AddAsync(Discount discount, CancellationToken cancellationToken = default)
    {
        _context.Discounts.Add(discount);
        await _context.SaveChangesAsync(cancellationToken);
        return discount;
    }

    public async Task AddRangeAsync(IEnumerable<Discount> discounts, CancellationToken cancellationToken = default)
    {
        // Single SaveChanges so a bulk operation either fully commits or fully fails.
        _context.Discounts.AddRange(discounts);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Discount discount, CancellationToken cancellationToken = default)
    {
        _context.Discounts.Update(discount);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Discount discount, CancellationToken cancellationToken = default)
    {
        _context.Discounts.Remove(discount);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
