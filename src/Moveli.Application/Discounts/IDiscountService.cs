using Moveli.Domain.Entities;

namespace Moveli.Application.Discounts;

/// <summary>
/// Resolves the customer-facing (discounted) price for products, applying
/// the most-specific live discount in the order Product > Category > Brand.
/// </summary>
public interface IDiscountService
{
    /// <summary>
    /// Loads all currently-live discounts once and returns a snapshot that can
    /// price many products without further DB round-trips (avoids N+1).
    /// </summary>
    Task<DiscountSnapshot> CreateSnapshotAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Immutable lookup of live discount percentages keyed by scope target id.
/// </summary>
public sealed class DiscountSnapshot
{
    private readonly IReadOnlyDictionary<Guid, decimal> _byProduct;
    private readonly IReadOnlyDictionary<Guid, decimal> _byCategory;
    private readonly IReadOnlyDictionary<Guid, decimal> _byBrand;

    public DiscountSnapshot(
        IReadOnlyDictionary<Guid, decimal> byProduct,
        IReadOnlyDictionary<Guid, decimal> byCategory,
        IReadOnlyDictionary<Guid, decimal> byBrand)
    {
        _byProduct = byProduct;
        _byCategory = byCategory;
        _byBrand = byBrand;
    }

    /// <summary>
    /// Returns the effective (price, compareAtPrice) for a product. When a live
    /// discount applies, price is reduced and compareAtPrice carries the original
    /// price (drives the strikethrough / -X% badge on the frontend). When no
    /// discount applies, the product's existing values are returned unchanged.
    /// </summary>
    public (decimal Price, decimal? CompareAtPrice) Apply(
        Guid productId, Guid categoryId, Guid brandId,
        decimal price, decimal? compareAtPrice)
    {
        decimal? percentage = null;

        if (_byProduct.TryGetValue(productId, out var p))
            percentage = p;
        else if (_byCategory.TryGetValue(categoryId, out var c))
            percentage = c;
        else if (_byBrand.TryGetValue(brandId, out var b))
            percentage = b;

        if (percentage is null or <= 0)
            return (price, compareAtPrice);

        var discounted = Math.Round(price * (1 - percentage.Value / 100m), 2, MidpointRounding.AwayFromZero);
        return (discounted, price);
    }

    /// <summary>Convenience overload for a fully-loaded product entity.</summary>
    public (decimal Price, decimal? CompareAtPrice) Apply(Product product) =>
        Apply(product.Id, product.CategoryId, product.BrandId, product.Price, product.CompareAtPrice);
}
