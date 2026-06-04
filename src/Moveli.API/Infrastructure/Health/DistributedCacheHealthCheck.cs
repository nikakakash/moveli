using System.Diagnostics;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Moveli.API.Infrastructure.Health;

/// <summary>
/// Readiness probe for the distributed cache (Redis when configured, in-process memory
/// otherwise). A round-trip set+get with a short-lived key verifies the cache is reachable
/// AND writable. Tagged "cache" so orchestrators can mark the instance as not-ready when
/// Redis is unavailable, even though the app degrades gracefully.
/// </summary>
public class DistributedCacheHealthCheck : IHealthCheck
{
    private readonly IDistributedCache _cache;

    public DistributedCacheHealthCheck(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var key = "health:probe";
        var payload = new byte[] { 0x01 };
        var sw = Stopwatch.StartNew();
        try
        {
            await _cache.SetAsync(key, payload,
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(5) },
                cancellationToken);
            var read = await _cache.GetAsync(key, cancellationToken);
            sw.Stop();
            return read != null
                ? HealthCheckResult.Healthy(data: new Dictionary<string, object> { ["latencyMs"] = sw.ElapsedMilliseconds })
                : HealthCheckResult.Degraded("Cache write succeeded but read returned null.");
        }
        catch (Exception ex)
        {
            // App degrades gracefully (queries fall through to DB), so Degraded — not Unhealthy.
            return HealthCheckResult.Degraded("Cache unreachable; app is serving without it.", ex);
        }
    }
}
