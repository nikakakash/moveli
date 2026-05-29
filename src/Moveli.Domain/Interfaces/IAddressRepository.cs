using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IAddressRepository
{
    Task<List<Address>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Address?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Address> AddAsync(Address address, CancellationToken cancellationToken = default);
    Task UpdateAsync(Address address, CancellationToken cancellationToken = default);
    Task DeleteAsync(Address address, CancellationToken cancellationToken = default);
    Task ClearDefaultAsync(Guid userId, CancellationToken cancellationToken = default);
}
