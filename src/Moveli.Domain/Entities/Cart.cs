namespace Moveli.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid? UserId { get; set; }
    public string? SessionId { get; set; }

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
