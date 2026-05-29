namespace Moveli.Application.Common;

/// <summary>
/// Cache keys for read-mostly reference data served from IMemoryCache.
/// Write handlers evict the relevant key so the next read repopulates from the database.
/// </summary>
public static class CacheKeys
{
    public const string CategoryTree = "categories:tree";
    public const string Brands = "brands:all";

    /// <summary>Short TTL for reference lists that change rarely but should stay reasonably fresh.</summary>
    public static readonly TimeSpan ReferenceDataTtl = TimeSpan.FromMinutes(10);

    /// <summary>
    /// Featured products carry discounted prices that depend on time-windowed discounts,
    /// so they use a short TTL instead of explicit invalidation.
    /// </summary>
    public static readonly TimeSpan FeaturedProductsTtl = TimeSpan.FromSeconds(60);

    public const string FeaturedProductsPrefix = "products:featured:";

    public static string FeaturedProducts(int count) => $"{FeaturedProductsPrefix}{count}";
}
