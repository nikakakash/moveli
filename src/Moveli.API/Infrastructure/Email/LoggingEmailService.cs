using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Email;

/// <summary>
/// Fallback email "sender" used when no SMTP host is configured (e.g. local development): it
/// logs the message instead of sending, so flows like password reset work without real SMTP.
/// </summary>
public class LoggingEmailService : IEmailService
{
    private readonly ILogger<LoggingEmailService> _logger;

    public LoggingEmailService(ILogger<LoggingEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[Email not sent — no SMTP configured] To: {Recipient} | Subject: {Subject}\n{Body}",
            toEmail, subject, htmlBody);
        return Task.CompletedTask;
    }
}
