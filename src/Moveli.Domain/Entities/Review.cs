namespace Moveli.Domain.Entities;

public class Review : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid UserId { get; set; }

    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsApproved { get; set; }
}
