using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Orders;
using Moveli.Application.Orders.Commands;
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
    private readonly CreateOrderCommandHandler _sut;

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

        _sut = new CreateOrderCommandHandler(
            _orderRepository.Object, _cartRepository.Object, _context, _promoService.Object);
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
    private static Cart CartSnapshot() => new()
    {
        Id = CartId,
        UserId = UserId,
        Items = new List<CartItem>
        {
            new()
            {
                CartId = CartId,
                ProductId = ProductId,
                Quantity = 2,
                UnitPrice = 100m,
                Product = new Product { Name = new LocalizedString("პროდუქტი", "Product") }
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

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
