namespace Moveli.Application.Common;

// Thrown by repositories when a unique constraint is violated under concurrency,
// so Application handlers can translate it into a clean Result instead of a 500.
public class DuplicateEntityException : Exception
{
    public DuplicateEntityException(string message) : base(message) { }
}
