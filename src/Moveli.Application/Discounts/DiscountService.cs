using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts;

public class DiscountService : IDiscountService
{
    private readonly IDiscountRepository _discountRepository;
    private readonly IMemoryCache _cache;
    private readonly ICacheInvalidator _invalidator;

    // Storefront hits this on every product list / detail page; rebuilding it per request
    // hits the Discounts table N times a second on a busy listing. Cache with a 60s ceiling
    // (in case a discount's StartsAt/EndsAt window opens) AND wire to ICacheInvalidator so
    // admin mutations evict it instantly. Key is constant — one snapshot covers all callers.
    private const string CacheKey = "discounts:snapshot";
    private static readonly TimeSpan Ttl = TimeSpan.FromSeconds(60);

    public DiscountService(IDiscountRepository discountRepository, IMemoryCache cache, ICacheInvalidator invalidator)
    {
        _discountRepository = discountRepository;
        _cache = cache;
        _invalidator = invalidator;
    }

    public async Task<DiscountSnapshot> CreateSnapshotAsync(CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(CacheKey, out DiscountSnapshot? cached) && cached is not null)
            return cached;

        var live = await _discountRepository.GetLiveAsync(cancellationToken);

        var byProduct = new Dictionary<Guid, decimal>();
        var byCategory = new Dictionary<Guid, decimal>();
        var byBrand = new Dictionary<Guid, decimal>();

        foreach (var d in live)
        {
            var target = d.Scope switch
            {
                DiscountScope.Product => byProduct,
                DiscountScope.Category => byCategory,
                DiscountScope.Brand => byBrand,
                _ => null
            };

            if (target is null) continue;

            // If multiple live discounts target the same id, keep the largest.
            if (!target.TryGetValue(d.TargetId, out var existing) || d.Percentage > existing)
                target[d.TargetId] = d.Percentage;
        }

        var snapshot = new DiscountSnapshot(byProduct, byCategory, byBrand);

        using var entry = _cache.CreateEntry(CacheKey);
        entry.AbsoluteExpirationRelativeToNow = Ttl;
        entry.AddExpirationToken(_invalidator.GetChangeToken(CacheInvalidatorScopes.Discounts));
        entry.Value = snapshot;

        return snapshot;
    }
}
