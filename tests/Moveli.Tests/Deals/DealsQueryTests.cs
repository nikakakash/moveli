using FluentAssertions;
using Moq;
using Moveli.Application.Deals.Queries;
using Moveli.Application.Discounts;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;
using Xunit;

namespace Moveli.Tests.Deals;

public class DealsQueryTests
{
    private readonly Mock<IDiscountRepository> _discounts = new();
    private readonly Mock<IProductRepository> _products = new();
    private readonly Mock<ICategoryRepository> _categories = new();
    private readonly Mock<IBrandRepository> _brands = new();
    private readonly Mock<IDiscountService> _discountService = new();

    private static readonly Guid ProductId = Guid.NewGuid();

    private static Product BuildProduct(Guid id, decimal price = 100m, int stock = 10) => new()
    {
        Id = id,
        Name = new LocalizedString("პ", "P"),
        Slug = "p",
        Price = price,
        StockQuantity = stock,
        IsActive = true,
        Category = new Category { Name = new LocalizedString("კ", "C"), Slug = "c" },
        Brand = new Brand { Name = "B", Slug = "b" }
    };

    private GetDealsQueryHandler DealsHandler() => new(
        _discounts.Object, _products.Object, _categories.Object, _brands.Object, _discountService.Object);

    [Fact]
    public async Task GetDeals_ExcludesPlacementNone()
    {
        _discountService.Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>()));
        _discounts.Setup(r => r.GetLiveAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Discount>
        {
            new() { Scope = DiscountScope.Category, TargetId = Guid.NewGuid(), Percentage = 10, Placement = DealPlacement.Featured },
            new() { Scope = DiscountScope.Category, TargetId = Guid.NewGuid(), Percentage = 5,  Placement = DealPlacement.None },
        });
        _categories.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Category { Name = new LocalizedString("კ", "C"), Slug = "c" });

        var result = await DealsHandler().Handle(new GetDealsQuery(), CancellationToken.None);

        result.Value!.Should().ContainSingle().Which.Placement.Should().Be("Featured");
    }

    [Fact]
    public async Task GetDeals_ProductScoped_CarriesDiscountedProduct()
    {
        _discounts.Setup(r => r.GetLiveAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Discount>
        {
            new() { Scope = DiscountScope.Product, TargetId = ProductId, Percentage = 20, Placement = DealPlacement.FlashSale }
        });
        _products.Setup(r => r.GetByIdAsync(ProductId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildProduct(ProductId, price: 100m));
        _discountService.Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(
                new Dictionary<Guid, decimal> { [ProductId] = 20m }, new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>()));

        var result = await DealsHandler().Handle(new GetDealsQuery(), CancellationToken.None);

        var deal = result.Value!.Single();
        deal.Product.Should().NotBeNull();
        deal.Product!.Price.Should().Be(80m);          // 100 - 20%
        deal.Product.CompareAtPrice.Should().Be(100m); // original
    }

    [Fact]
    public async Task GetDeals_HomeOnly_FiltersToShowOnHome()
    {
        _discountService.Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>()));
        _discounts.Setup(r => r.GetLiveAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Discount>
        {
            new() { Scope = DiscountScope.Brand, TargetId = Guid.NewGuid(), Percentage = 10, Placement = DealPlacement.DealsPage, ShowOnHome = true },
            new() { Scope = DiscountScope.Brand, TargetId = Guid.NewGuid(), Percentage = 10, Placement = DealPlacement.DealsPage, ShowOnHome = false },
        });
        _brands.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Brand { Name = "B", Slug = "b" });

        var result = await DealsHandler().Handle(new GetDealsQuery(HomeOnly: true), CancellationToken.None);

        result.Value!.Should().ContainSingle().Which.ShowOnHome.Should().BeTrue();
    }

    [Fact]
    public async Task GetDealProducts_ReturnsOnlyDiscounted_SortedByPercentageDesc()
    {
        var a = BuildProduct(Guid.NewGuid());  // 10% off
        var b = BuildProduct(Guid.NewGuid());  // 40% off
        var c = BuildProduct(Guid.NewGuid());  // no discount
        _products.Setup(r => r.GetProductsAsync(
                It.IsAny<int>(), It.IsAny<int>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(),
                It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<decimal?>(),
                It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Product> { a, b, c }, 3));
        _discountService.Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(
                new Dictionary<Guid, decimal> { [a.Id] = 10m, [b.Id] = 40m }, new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>()));

        var handler = new GetDealProductsQueryHandler(_products.Object, _discountService.Object);
        var result = await handler.Handle(new GetDealProductsQuery(), CancellationToken.None);

        var items = result.Value!.Items;
        items.Should().HaveCount(2);                 // c (no discount) excluded
        items[0].Id.Should().Be(b.Id);               // 40% first
        items[1].Id.Should().Be(a.Id);               // then 10%
    }
}
