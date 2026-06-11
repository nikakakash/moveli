namespace Moveli.Application.Common;

/// <summary>Minimal read-side lookup of user contact info for notifications (avoids leaking Identity into Application handlers).</summary>
public interface IUserLookup
{
    Task<string?> GetEmailAsync(Guid userId, CancellationToken cancellationToken = default);
}
