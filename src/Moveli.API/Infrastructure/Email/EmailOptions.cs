namespace Moveli.API.Infrastructure.Email;

/// <summary>Bound from the "Email" configuration section (supplied via env in production).</summary>
public class EmailOptions
{
    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public string? User { get; set; }
    public string? Password { get; set; }
    public string FromAddress { get; set; } = "no-reply@moveli.ge";
    public string FromName { get; set; } = "Moveli";
    public bool UseStartTls { get; set; } = true;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Host);
}
