using FluentAssertions;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Xunit;

namespace Moveli.Tests.Domain;

public class DiscountTests
{
    private static readonly DateTime Now = new(2026, 5, 29, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void IsLive_ReturnsTrue_WhenActiveAndNoWindow()
    {
        var d = new Discount { Scope = DiscountScope.Product, IsActive = true };

        d.IsLive(Now).Should().BeTrue();
    }

    [Fact]
    public void IsLive_ReturnsFalse_WhenInactive()
    {
        var d = new Discount { IsActive = false };

        d.IsLive(Now).Should().BeFalse();
    }

    [Fact]
    public void IsLive_ReturnsFalse_WhenScheduledForFuture()
    {
        var d = new Discount { IsActive = true, StartsAt = Now.AddHours(1) };

        d.IsLive(Now).Should().BeFalse();
    }

    [Fact]
    public void IsLive_ReturnsFalse_WhenExpired()
    {
        var d = new Discount { IsActive = true, EndsAt = Now.AddHours(-1) };

        d.IsLive(Now).Should().BeFalse();
    }

    [Fact]
    public void IsLive_ReturnsTrue_OnStartBoundary()
    {
        var d = new Discount { IsActive = true, StartsAt = Now };

        d.IsLive(Now).Should().BeTrue();
    }

    [Fact]
    public void IsLive_ReturnsTrue_OnEndBoundary()
    {
        var d = new Discount { IsActive = true, EndsAt = Now };

        d.IsLive(Now).Should().BeTrue();
    }

    [Fact]
    public void IsLive_ReturnsTrue_WithinWindow()
    {
        var d = new Discount { IsActive = true, StartsAt = Now.AddDays(-2), EndsAt = Now.AddDays(2) };

        d.IsLive(Now).Should().BeTrue();
    }
}
