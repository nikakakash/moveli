using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Cart?> GetBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default);
    Task<Cart> CreateAsync(Cart cart, CancellationToken cancellationToken = default);
    Task UpdateAsync(Cart cart, CancellationToken cancellationToken = default);
    Task AddItemAsync(CartItem item, CancellationToken cancellationToken = default);
    Task UpdateItemAsync(CartItem item, CancellationToken cancellationToken = default);

    /// <summary>
    /// Atomically increments an item's quantity by <paramref name="delta"/> only if the result
    /// stays within <paramref name="maxStock"/>. Returns false if the guard fails (insufficient
    /// stock). Avoids the read-modify-write lost update when two adds race on the same item.
    /// </summary>
    Task<bool> TryIncrementItemQuantityAsync(Guid itemId, int delta, int maxStock, decimal unitPrice, CancellationToken cancellationToken = default);

    Task RemoveItemAsync(CartItem item, CancellationToken cancellationToken = default);
    Task ClearCartAsync(Guid cartId, CancellationToken cancellationToken = default);
}
