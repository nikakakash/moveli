namespace Moveli.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? OrderId { get; set; }
    public bool IsRead { get; set; }
}
