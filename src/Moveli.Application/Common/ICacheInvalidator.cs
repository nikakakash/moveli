using Microsoft.Extensions.Primitives;

namespace Moveli.Application.Common;

/// <summary>
/// Per-domain expiration token holder for IMemoryCache entries. Registers a
/// CancellationChangeToken with every cache entry; calling <see cref="Invalidate"/>
/// fires every entry that registered the token. This lets mutation handlers wipe
/// a whole family of cache keys (e.g. all `products:featured:{count}` variants)
/// without having to enumerate them.
/// </summary>
public interface ICacheInvalidator
{
    /// <summary>Token to attach via <c>entry.AddExpirationToken(...)</c>.</summary>
    IChangeToken GetChangeToken(string scope);

    /// <summary>Expire every entry that registered the token for this scope.</summary>
    void Invalidate(string scope);
}

public static class CacheInvalidatorScopes
{
    public const string FeaturedProducts = "products:featured";
    public const string Discounts = "discounts";
    public const string Settings = "settings";
}
