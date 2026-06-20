namespace Moveli.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Stamped by MoveliDbContext at persistence time (not construction) so the value reflects
    // the actual insert and can't be backdated by clock skew or a client-supplied value.
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
