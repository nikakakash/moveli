using Moveli.Domain.Enums;

namespace Moveli.Domain.Entities;

public class Discount : BaseEntity
{
    public DiscountScope Scope { get; set; }
    public Guid TargetId { get; set; }
    public decimal Percentage { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }

    public bool IsLive(DateTime now) =>
        IsActive
        && (StartsAt == null || now >= StartsAt)
        && (EndsAt == null || now <= EndsAt);
}
