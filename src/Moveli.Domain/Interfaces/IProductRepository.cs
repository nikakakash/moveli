using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IProductRepository
{
    Task<(List<Product> Items, int TotalCount)> GetProductsAsync(
        int page, int pageSize,
        Guid? categoryId = null, Guid? brandId = null,
        decimal? minPrice = null, decimal? maxPrice = null,
        decimal? minRating = null,
        string? search = null, string? sortBy = null,
        CancellationToken cancellationToken = default);

    // Price distribution for the filter sidebar histogram. Respects every filter except
    // price itself, so the bars show the full range the shopper can still choose from.
    Task<(decimal Min, decimal Max, IReadOnlyList<int> Buckets)> GetPriceHistogramAsync(
        int buckets,
        Guid? categoryId = null, Guid? brandId = null,
        decimal? minRating = null, string? search = null,
        CancellationToken cancellationToken = default);

    Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Product>> GetByIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken = default);
    Task<List<Product>> GetFeaturedAsync(int count = 10, CancellationToken cancellationToken = default);
    /// <summary>Atomically increments stock for each (productId, quantity) — used to restock a cancelled order.</summary>
    Task RestockAsync(IEnumerable<(Guid ProductId, int Quantity)> items, CancellationToken cancellationToken = default);
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteAsync(Product product, CancellationToken cancellationToken = default);
}
