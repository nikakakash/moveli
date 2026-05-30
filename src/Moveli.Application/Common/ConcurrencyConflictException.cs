namespace Moveli.Application.Common;

// Thrown by repositories when an optimistic-concurrency token detects a conflicting
// concurrent update, so Application handlers can return a clean Result without
// depending on EF Core's DbUpdateConcurrencyException.
public class ConcurrencyConflictException : Exception
{
    public ConcurrencyConflictException(string message) : base(message) { }
}
