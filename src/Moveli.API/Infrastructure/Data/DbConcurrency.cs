using Microsoft.EntityFrameworkCore;

namespace Moveli.API.Infrastructure.Data;

public static class DbConcurrency
{
    // Detects a unique-constraint violation for both providers used in this solution:
    // Postgres (prod) reports SqlState 23505. SQLite (tests) is matched by type name + message
    // so the API project needn't take a compile-time dependency on Microsoft.Data.Sqlite.
    public static bool IsUniqueViolation(DbUpdateException ex)
    {
        return ex.InnerException switch
        {
            Npgsql.PostgresException pg => pg.SqlState == "23505",
            { } inner when inner.GetType().FullName == "Microsoft.Data.Sqlite.SqliteException"
                => inner.Message.Contains("UNIQUE constraint failed", StringComparison.OrdinalIgnoreCase),
            _ => false
        };
    }
}
