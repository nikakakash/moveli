using System.Collections.Concurrent;
using Microsoft.Extensions.Primitives;
using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Caching;

/// <summary>
/// Singleton implementation backed by a per-scope CancellationTokenSource.
/// On Invalidate, the current source is swapped with a fresh one and the
/// old one cancelled, firing every IChangeToken handed out to cache entries.
/// </summary>
public sealed class CacheInvalidator : ICacheInvalidator
{
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _sources = new();

    public IChangeToken GetChangeToken(string scope)
    {
        var cts = _sources.GetOrAdd(scope, _ => new CancellationTokenSource());
        return new CancellationChangeToken(cts.Token);
    }

    public void Invalidate(string scope)
    {
        var fresh = new CancellationTokenSource();
        if (_sources.TryGetValue(scope, out var existing) &&
            _sources.TryUpdate(scope, fresh, existing))
        {
            existing.Cancel();
            existing.Dispose();
        }
        else
        {
            // Either no entry exists yet (nothing cached for this scope) or a
            // concurrent invalidate already swapped; in both cases inserting our
            // fresh source primes the next read, and we have no old source to cancel.
            _sources.TryAdd(scope, fresh);
        }
    }
}
