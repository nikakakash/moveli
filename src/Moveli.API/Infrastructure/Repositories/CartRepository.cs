using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Application.Common;
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
            .AsNoTracking()
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
    }

    public async Task<Cart?> GetBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .AsNoTracking()
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
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbConcurrency.IsUniqueViolation(ex))
        {
            // Concurrent add for the same (CartId, ProductId) hit the unique index.
            _context.Entry(item).State = EntityState.Detached;
            throw new DuplicateEntityException("Item already in cart.");
        }
    }

    public async Task UpdateItemAsync(CartItem item, CancellationToken cancellationToken = default)
    {
        // Targeted column update by id rather than Update(item): the item comes from an
        // AsNoTracking cart load and carries a Product navigation, so attaching the whole graph
        // collides with the product the caller already tracked (stock/discount lookup). Updating
        // only the scalar columns sidesteps tracking entirely.
        await _context.Set<CartItem>()
            .Where(i => i.Id == item.Id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(i => i.Quantity, item.Quantity)
                .SetProperty(i => i.UnitPrice, item.UnitPrice), cancellationToken);
    }

    public async Task<bool> TryIncrementItemQuantityAsync(Guid itemId, int delta, int maxStock, decimal unitPrice, CancellationToken cancellationToken = default)
    {
        var affected = await _context.Set<CartItem>()
            .Where(i => i.Id == itemId && i.Quantity + delta <= maxStock)
            .ExecuteUpdateAsync(s => s
                .SetProperty(i => i.Quantity, i => i.Quantity + delta)
                .SetProperty(i => i.UnitPrice, unitPrice), cancellationToken);
        return affected > 0;
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
