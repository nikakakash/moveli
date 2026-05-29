using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly MoveliDbContext _context;

    public CartRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
    }

    public async Task<Cart?> GetBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.SessionId == sessionId, cancellationToken);
    }

    public async Task<Cart> CreateAsync(Cart cart, CancellationToken cancellationToken = default)
    {
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync(cancellationToken);
        return cart;
    }

    public async Task UpdateAsync(Cart cart, CancellationToken cancellationToken = default)
    {
        _context.Carts.Update(cart);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddItemAsync(CartItem item, CancellationToken cancellationToken = default)
    {
        _context.Set<CartItem>().Add(item);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateItemAsync(CartItem item, CancellationToken cancellationToken = default)
    {
        _context.Set<CartItem>().Update(item);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveItemAsync(CartItem item, CancellationToken cancellationToken = default)
    {
        _context.Set<CartItem>().Remove(item);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearCartAsync(Guid cartId, CancellationToken cancellationToken = default)
    {
        var items = await _context.Set<CartItem>().Where(i => i.CartId == cartId).ToListAsync(cancellationToken);
        _context.Set<CartItem>().RemoveRange(items);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
