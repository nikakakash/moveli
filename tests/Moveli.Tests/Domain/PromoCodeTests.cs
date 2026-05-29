using FluentAssertions;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Xunit;

namespace Moveli.Tests.Domain;

public class PromoCodeTests
{
    private static readonly DateTime Now = new(2026, 5, 29, 12, 0, 0, DateTimeKind.Utc);

    // ---- IsLive ----

    [Fact]
    public void IsLive_ReturnsTrue_WhenActiveAndNoWindow()
    {
        var promo = new PromoCode { IsActive = true, StartsAt = null, EndsAt = null };

        promo.IsLive(Now).Should().BeTrue();
    }

    [Fact]
    public void IsLive_ReturnsFalse_WhenInactive()
    {
        var promo = new PromoCode { IsActive = false, StartsAt = null, EndsAt = null };

        promo.IsLive(Now).Should().BeFalse();
    }

    [Fact]
    public void IsLive_ReturnsFalse_WhenStartsInFuture()
    {
        var promo = new PromoCode { IsActive = true, StartsAt = Now.AddDays(1) };

        promo.IsLive(Now).Should().BeFalse();
    }

    [Fact]
    public void IsLive_ReturnsFalse_WhenAlreadyEnded()
    {
        var promo = new PromoCode { IsActive = true, EndsAt = Now.AddDays(-1) };

        promo.IsLive(Now).Should().BeFalse();
    }

    [Fact]
    public void IsLive_ReturnsTrue_OnStartBoundary()
    {
        var promo = new PromoCode { IsActive = true, StartsAt = Now };

        promo.IsLive(Now).Should().BeTrue();
    }

    [Fact]
    public void IsLive_ReturnsTrue_OnEndBoundary()
    {
        var promo = new PromoCode { IsActive = true, EndsAt = Now };

        promo.IsLive(Now).Should().BeTrue();
    }

    [Fact]
    public void IsLive_ReturnsTrue_WithinWindow()
    {
        var promo = new PromoCode { IsActive = true, StartsAt = Now.AddDays(-1), EndsAt = Now.AddDays(1) };

        promo.IsLive(Now).Should().BeTrue();
    }

    // ---- ComputeDiscount ----

    [Theory]
    [InlineData(100, 15, 15)]    // 15% of 100
    [InlineData(90, 15, 13.5)]   // 15% of 90
    [InlineData(33.33, 10, 3.33)] // rounds to 2 dp (3.333 -> 3.33)
    public void ComputeDiscount_Percentage_RoundsToTwoDecimals(decimal subtotal, decimal value, decimal expected)
    {
        var promo = new PromoCode { Type = PromoDiscountType.Percentage, Value = value };

        promo.ComputeDiscount(subtotal).Should().Be(expected);
    }

    [Fact]
    public void ComputeDiscount_FixedAmount_ReturnsValue()
    {
        var promo = new PromoCode { Type = PromoDiscountType.FixedAmount, Value = 20 };

        promo.ComputeDiscount(100).Should().Be(20);
    }

    [Fact]
    public void ComputeDiscount_FixedAmount_IsCappedAtSubtotal()
    {
        var promo = new PromoCode { Type = PromoDiscountType.FixedAmount, Value = 80 };

        promo.ComputeDiscount(50).Should().Be(50);
    }

    [Fact]
    public void ComputeDiscount_Percentage_NeverExceedsSubtotal()
    {
        var promo = new PromoCode { Type = PromoDiscountType.Percentage, Value = 100 };

        promo.ComputeDiscount(40).Should().Be(40);
    }
}
