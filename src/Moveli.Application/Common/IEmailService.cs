namespace Moveli.Application.Common;

/// <summary>
/// Sends transactional email. Implementations are best-effort from the caller's perspective —
/// callers should not fail a business operation (order, status change) if email delivery throws.
/// </summary>
public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
