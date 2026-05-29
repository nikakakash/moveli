using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IProductRepository
{
    Task<(List<Product> Items, int TotalCount)> GetProductsAsync(
        int page, int pageSize,
        Guid? categoryId = null, Guid? brandId = null,
        decimal? minPrice = null, decimal? maxPrice = null,
        string? search = null, string? sortBy = null,
        CancellationToken cancellationToken = default);

    Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Product>> GetFeaturedAsync(int count = 10, CancellationToken cancellationToken = default);
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteAsync(Product product, CancellationToken cancellationToken = default);
}
