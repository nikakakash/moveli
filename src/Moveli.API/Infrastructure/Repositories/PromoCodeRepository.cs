using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class PromoCodeRepository : IPromoCodeRepository
{
    private readonly MoveliDbContext _context;

    public PromoCodeRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<(List<PromoCode> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.PromoCodes.OrderByDescending(p => p.CreatedAt);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<PromoCode?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _context.PromoCodes.FindAsync([id], cancellationToken);

    public async Task<PromoCode?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = code.Trim().ToUpperInvariant();
        return await _context.PromoCodes
            .FirstOrDefaultAsync(p => p.Code == normalized, cancellationToken);
    }

    public async Task AddAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        _context.PromoCodes.Add(promoCode);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        _context.PromoCodes.Update(promoCode);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        _context.PromoCodes.Remove(promoCode);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> HasUserRedeemedAsync(Guid promoCodeId, Guid userId, CancellationToken cancellationToken = default) =>
        await _context.PromoCodeRedemptions
            .AnyAsync(r => r.PromoCodeId == promoCodeId && r.UserId == userId, cancellationToken);

    public async Task<int> GetRedemptionCountAsync(Guid promoCodeId, CancellationToken cancellationToken = default) =>
        await _context.PromoCodeRedemptions
            .CountAsync(r => r.PromoCodeId == promoCodeId, cancellationToken);

    public async Task<Dictionary<Guid, int>> GetRedemptionCountsAsync(CancellationToken cancellationToken = default) =>
        await _context.PromoCodeRedemptions
            .GroupBy(r => r.PromoCodeId)
            .Select(g => new { PromoCodeId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PromoCodeId, x => x.Count, cancellationToken);
}
