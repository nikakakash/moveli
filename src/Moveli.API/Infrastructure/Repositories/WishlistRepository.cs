using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class WishlistRepository : IWishlistRepository
{
    private readonly MoveliDbContext _context;

    public WishlistRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<List<Wishlist>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Wishlists
            .Include(w => w.Product)
                .ThenInclude(p => p.Category)
            .Include(w => w.Product)
                .ThenInclude(p => p.Brand)
            .Include(w => w.Product)
                .ThenInclude(p => p.Images)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Wishlist?> GetAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default)
    {
        return await _context.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId, cancellationToken);
    }

    public async Task<Wishlist> AddAsync(Wishlist wishlist, CancellationToken cancellationToken = default)
    {
        _context.Wishlists.Add(wishlist);
        await _context.SaveChangesAsync(cancellationToken);
        return wishlist;
    }

    public async Task RemoveAsync(Wishlist wishlist, CancellationToken cancellationToken = default)
    {
        _context.Wishlists.Remove(wishlist);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
