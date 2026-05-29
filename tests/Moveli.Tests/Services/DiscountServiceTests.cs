using FluentAssertions;
using Moq;
using Moveli.Application.Discounts;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;
using Xunit;

namespace Moveli.Tests.Services;

public class DiscountServiceTests
{
    private readonly Mock<IDiscountRepository> _repo = new();
    private readonly DiscountService _sut;

    public DiscountServiceTests()
    {
        _sut = new DiscountService(_repo.Object);
    }

    private void SetupLive(params Discount[] discounts) =>
        _repo.Setup(r => r.GetLiveAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(discounts.ToList());

    [Fact]
    public async Task CreateSnapshotAsync_KeepsLargestPercentage_ForSameTarget()
    {
        var target = Guid.NewGuid();
        SetupLive(
            new Discount { Scope = DiscountScope.Product, TargetId = target, Percentage = 10 },
            new Discount { Scope = DiscountScope.Product, TargetId = target, Percentage = 25 });

        var snapshot = await _sut.CreateSnapshotAsync();

        // 25% of 100 -> 75
        var (price, original) = snapshot.Apply(target, Guid.NewGuid(), Guid.NewGuid(), 100m, null);
        price.Should().Be(75m);
        original.Should().Be(100m);
    }

    [Fact]
    public async Task CreateSnapshotAsync_AppliesProductOverCategoryOverBrand()
    {
        var productId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var brandId = Guid.NewGuid();
        SetupLive(
            new Discount { Scope = DiscountScope.Product, TargetId = productId, Percentage = 10 },
            new Discount { Scope = DiscountScope.Category, TargetId = categoryId, Percentage = 20 },
            new Discount { Scope = DiscountScope.Brand, TargetId = brandId, Percentage = 30 });

        var snapshot = await _sut.CreateSnapshotAsync();

        // Product wins (10%) even though category/brand are larger
        var (price, _) = snapshot.Apply(productId, categoryId, brandId, 100m, null);
        price.Should().Be(90m);
    }

    [Fact]
    public async Task CreateSnapshotAsync_FallsBackToCategory_WhenNoProductDiscount()
    {
        var categoryId = Guid.NewGuid();
        var brandId = Guid.NewGuid();
        SetupLive(
            new Discount { Scope = DiscountScope.Category, TargetId = categoryId, Percentage = 20 },
            new Discount { Scope = DiscountScope.Brand, TargetId = brandId, Percentage = 30 });

        var snapshot = await _sut.CreateSnapshotAsync();

        var (price, _) = snapshot.Apply(Guid.NewGuid(), categoryId, brandId, 100m, null);
        price.Should().Be(80m);
    }

    [Fact]
    public async Task CreateSnapshotAsync_FallsBackToBrand_WhenNoProductOrCategoryDiscount()
    {
        var brandId = Guid.NewGuid();
        SetupLive(new Discount { Scope = DiscountScope.Brand, TargetId = brandId, Percentage = 30 });

        var snapshot = await _sut.CreateSnapshotAsync();

        var (price, _) = snapshot.Apply(Guid.NewGuid(), Guid.NewGuid(), brandId, 100m, null);
        price.Should().Be(70m);
    }

    [Fact]
    public async Task Apply_ReturnsUnchanged_WhenNoLiveDiscount()
    {
        SetupLive(); // none

        var snapshot = await _sut.CreateSnapshotAsync();

        var (price, original) = snapshot.Apply(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 49.99m, 59.99m);
        price.Should().Be(49.99m);
        original.Should().Be(59.99m); // manual compareAtPrice preserved
    }

    [Fact]
    public void Apply_RoundsAwayFromZero_ToTwoDecimals()
    {
        var productId = Guid.NewGuid();
        var byProduct = new Dictionary<Guid, decimal> { [productId] = 15 };
        var snapshot = new DiscountSnapshot(
            byProduct,
            new Dictionary<Guid, decimal>(),
            new Dictionary<Guid, decimal>());

        // 33.33 * 0.85 = 28.3305 -> 28.33
        var (price, original) = snapshot.Apply(productId, Guid.NewGuid(), Guid.NewGuid(), 33.33m, null);
        price.Should().Be(28.33m);
        original.Should().Be(33.33m);
    }
}
