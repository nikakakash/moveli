using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Moveli.API.Infrastructure.Data;

namespace Moveli.API.Infrastructure.Health;

/// <summary>
/// Readiness probe that verifies the database is reachable. Used by /health for
/// load balancers and orchestrators.
/// </summary>
public class DatabaseHealthCheck : IHealthCheck
{
    private readonly MoveliDbContext _context;

    public DatabaseHealthCheck(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            return canConnect
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy("Database is not reachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database connectivity check failed.", ex);
        }
    }
}
