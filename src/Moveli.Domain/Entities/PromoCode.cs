using Moveli.Domain.Enums;

namespace Moveli.Domain.Entities;

public class PromoCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public PromoDiscountType Type { get; set; }
    public decimal Value { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }

    /// <summary>Maximum total redemptions across all users. Null = unlimited.</summary>
    public int? MaxRedemptions { get; set; }

    public bool IsLive(DateTime now) =>
        IsActive
        && (StartsAt == null || now >= StartsAt)
        && (EndsAt == null || now <= EndsAt);

    public decimal ComputeDiscount(decimal subtotal)
    {
        var discount = Type == PromoDiscountType.Percentage
            ? Math.Round(subtotal * Value / 100m, 2, MidpointRounding.AwayFromZero)
            : Value;
        return Math.Min(discount, subtotal);
    }
}
