using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IWishlistRepository
{
    Task<List<Wishlist>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Wishlist?> GetAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default);
    Task<Wishlist> AddAsync(Wishlist wishlist, CancellationToken cancellationToken = default);
    Task RemoveAsync(Wishlist wishlist, CancellationToken cancellationToken = default);
}
