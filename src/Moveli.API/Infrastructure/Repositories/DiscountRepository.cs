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

    public async Task<List<Discount>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Discounts
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
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
