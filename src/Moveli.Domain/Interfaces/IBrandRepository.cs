using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IBrandRepository
{
    Task<List<Brand>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Brand?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Brand?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Brand> AddAsync(Brand brand, CancellationToken cancellationToken = default);
    Task UpdateAsync(Brand brand, CancellationToken cancellationToken = default);
    Task DeleteAsync(Brand brand, CancellationToken cancellationToken = default);
    Task<int> GetProductCountAsync(Guid brandId, CancellationToken cancellationToken = default);
}
