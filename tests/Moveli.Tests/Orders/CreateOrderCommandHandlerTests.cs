using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moveli.API.Infrastructure.Data;
using Microsoft.Extensions.Logging.Abstractions;
using Moveli.API.Infrastructure.Orders;
using Moveli.Application.Common;
using Moveli.Application.Orders.Commands;
using Moveli.Application.PromoCodes;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;
using Xunit;

namespace Moveli.Tests.Orders;

public class CreateOrderCommandHandlerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly MoveliDbContext _context;
    private readonly Mock<ICartRepository> _cartRepository = new();
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<Moveli.Application.PromoCodes.IPromoCodeService> _promoService = new();
    private readonly Mock<ISettingsRepository> _settingsRepository = new();
    private readonly Mock<Moveli.Application.Discounts.IDiscountService> _discountService = new();
    private readonly Mock<IUserLookup> _userLookup = new();
    private readonly Mock<IEmailService> _emailService = new();
    private readonly CreateOrderCommandHandler _sut;

    private static readonly Guid PromoId = Guid.NewGuid();
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid ProductId = Guid.NewGuid();
    private static readonly Guid CartId = Guid.NewGuid();

    public CreateOrderCommandHandlerTests()
    {
        // Real schema on an in-memory SQLite DB; keep the connection open for the test lifetime.
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<MoveliDbContext>()
            .UseSqlite(_connection)
            .Options;
        _context = new MoveliDbContext(options);
        _context.Database.EnsureCreated();

        _orderRepository
            .Setup(r => r.GenerateOrderNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("MV-260001");

        // Default store settings (free-shipping city თბილისი, ₾100 threshold, ₾5 in-city cost).
        _settingsRepository
            .Setup(r => r.GetAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StoreSettings());

        // Empty discount snapshot → checkout re-pricing returns each product's base price.
        _discountService
            .Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Moveli.Application.Discounts.DiscountSnapshot(
                new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>()));

        _sut = new CreateOrderCommandHandler(
            _orderRepository.Object, _cartRepository.Object, _context, _promoService.Object,
            _settingsRepository.Object, _discountService.Object, _userLookup.Object, _emailService.Object,
            NullLogger<CreateOrderCommandHandler>.Instance);
    }

    private void SeedCatalog(int stock)
    {
        var category = new Category { Name = new LocalizedString("კ", "C"), Slug = "c" };
        var brand = new Brand { Name = "B", Slug = "b" };
        var product = new Product
        {
            Id = ProductId,
            Name = new LocalizedString("პროდუქტი", "Product"),
            Slug = "product",
            Price = 100m,
            StockQuantity = stock,
            IsActive = true,
            Category = category,
            Brand = brand
        };
        var cart = new Cart { Id = CartId, UserId = UserId };
        var item = new CartItem { CartId = CartId, ProductId = ProductId, Quantity = 2, UnitPrice = 100m };

        _context.AddRange(category, brand, product, cart, item);
        _context.SaveChanges();
        _context.ChangeTracker.Clear();
    }

    // Detached snapshot the cart repository hands back — mirrors what a client resubmits.
    // Product carries Id + Price because checkout re-prices each line from the live product.
    private static Cart CartSnapshot(decimal unitPrice = 100m, int quantity = 2) => new()
    {
        Id = CartId,
        UserId = UserId,
        Items = new List<CartItem>
        {
            new()
            {
                CartId = CartId,
                ProductId = ProductId,
                Quantity = quantity,
                UnitPrice = unitPrice,
                Product = new Product { Id = ProductId, Name = new LocalizedString("პროდუქტი", "Product"), Price = unitPrice }
            }
        }
    };

    private static CreateOrderCommand Command() => new(
        UserId,
        ShippingFullName: "Test User",
        ShippingPhoneNumber: "555000000",
        ShippingCity: "Batumi",
        ShippingStreet: "Main St 1",
        ShippingPostalCode: null,
        PaymentMethod: PaymentMethod.CashOnDelivery,
        Notes: null,
        PromoCode: null);

    [Fact]
    public async Task Handle_WithSufficientStock_DecrementsStockAndEmptiesCart()
    {
        SeedCatalog(stock: 15);
        _cartRepository.Setup(r => r.GetByUserIdAsync(UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CartSnapshot());

        var result = await _sut.Handle(Command(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        var stock = await _context.Products.AsNoTracking().Where(p => p.Id == ProductId)
            .Select(p => p.StockQuantity).SingleAsync();
        stock.Should().Be(13);
        var remaining = await _context.CartItems.AsNoTracking().CountAsync(i => i.CartId == CartId);
        remaining.Should().Be(0);
    }

    [Fact]
    public async Task Handle_WithInsufficientStock_FailsAndLeavesStockAndCartUntouched()
    {
        SeedCatalog(stock: 1);
        _cartRepository.Setup(r => r.GetByUserIdAsync(UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CartSnapshot());

        var result = await _sut.Handle(Command(), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        var stock = await _context.Products.AsNoTracking().Where(p => p.Id == ProductId)
            .Select(p => p.StockQuantity).SingleAsync();
        stock.Should().Be(1);
        var remaining = await _context.CartItems.AsNoTracking().CountAsync(i => i.CartId == CartId);
        remaining.Should().Be(1);
        (await _context.Orders.AsNoTracking().CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task Handle_WhenCartAlreadyConsumed_RejectsReplayWithoutSecondOrder()
    {
        SeedCatalog(stock: 15);
        _cartRepository.Setup(r => r.GetByUserIdAsync(UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CartSnapshot());

        var first = await _sut.Handle(Command(), CancellationToken.None);
        var replay = await _sut.Handle(Command(), CancellationToken.None);

        first.IsSuccess.Should().BeTrue();
        replay.IsSuccess.Should().BeFalse();
        var stock = await _context.Products.AsNoTracking().Where(p => p.Id == ProductId)
            .Select(p => p.StockQuantity).SingleAsync();
        stock.Should().Be(13);
        (await _context.Orders.AsNoTracking().CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task Handle_WhenSubtotalBelowMinimum_FailsAndCreatesNoOrder()
    {
        SeedCatalog(stock: 15);
        // Re-priced subtotal = 10 (1 × ₾10), below the ₾30 minimum.
        _cartRepository.Setup(r => r.GetByUserIdAsync(UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CartSnapshot(unitPrice: 10m, quantity: 1));

        var result = await _sut.Handle(Command(), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Minimum order");
        (await _context.Orders.AsNoTracking().CountAsync()).Should().Be(0);
        var stock = await _context.Products.AsNoTracking().Where(p => p.Id == ProductId)
            .Select(p => p.StockQuantity).SingleAsync();
        stock.Should().Be(15); // decrement rolled back
    }

    [Fact]
    public async Task Handle_WhenPromoAtGlobalCap_RejectsAndRollsBack()
    {
        SeedCatalog(stock: 15);
        // A single-use (MaxRedemptions = 1) promo that has already been redeemed once (by another user).
        _context.PromoCodes.Add(new PromoCode
        {
            Id = PromoId, Code = "CAP", Type = PromoDiscountType.FixedAmount,
            Value = 5m, IsActive = true, MaxRedemptions = 1
        });
        _context.PromoCodeRedemptions.Add(new PromoCodeRedemption
        {
            PromoCodeId = PromoId, UserId = Guid.NewGuid(), OrderId = Guid.NewGuid()
        });
        _context.SaveChanges();
        _context.ChangeTracker.Clear();

        _cartRepository.Setup(r => r.GetByUserIdAsync(UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CartSnapshot());
        _promoService.Setup(s => s.ValidateAsync("CAP", It.IsAny<decimal>(), UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<PromoValidationResult>.Success(
                new PromoValidationResult(PromoId, "CAP", 5m, MaxRedemptions: 1)));

        var result = await _sut.Handle(Command() with { PromoCode = "CAP" }, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("no longer available");
        (await _context.Orders.AsNoTracking().CountAsync()).Should().Be(0);
        var stock = await _context.Products.AsNoTracking().Where(p => p.Id == ProductId)
            .Select(p => p.StockQuantity).SingleAsync();
        stock.Should().Be(15); // decrement rolled back
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
