using Moveli.Domain.Enums;
using Moveli.Domain.ValueObjects;

namespace Moveli.Domain.Entities;

public class Discount : BaseEntity
{
    public DiscountScope Scope { get; set; }
    public Guid TargetId { get; set; }
    public decimal Percentage { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }

    // Merchandising / presentation layer (ignored by pricing). When Placement != None this
    // discount also renders as a curated deal on the deals page / home.
    public LocalizedString Title { get; set; } = new();
    public string? ImageUrl { get; set; }
    public DealPlacement Placement { get; set; } = DealPlacement.None;
    public bool ShowOnHome { get; set; }
    public bool ShowCountdown { get; set; }

    public bool IsLive(DateTime now) =>
        IsActive
        && (StartsAt == null || now >= StartsAt)
        && (EndsAt == null || now <= EndsAt);
}
