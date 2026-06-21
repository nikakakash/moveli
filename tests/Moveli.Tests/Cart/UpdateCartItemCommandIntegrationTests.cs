using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Repositories;
using Moveli.Application.Cart.Commands;
using Moveli.Application.Discounts;
using Moveli.Domain.Entities;
using Moveli.Domain.ValueObjects;
using Xunit;

namespace Moveli.Tests.Carts;

// Uses the REAL CartRepository + ProductRepository against a real (SQLite) DbContext so the
// EF change-tracking path is exercised — the mocked handler tests can't catch a tracking conflict.
public class UpdateCartItemCommandIntegrationTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly MoveliDbContext _context;
    private readonly UpdateCartItemCommandHandler _sut;

    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid ProductId = Guid.NewGuid();
    private static readonly Guid CartId = Guid.NewGuid();
    private static readonly Guid ItemId = Guid.NewGuid();

    public UpdateCartItemCommandIntegrationTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<MoveliDbContext>().UseSqlite(_connection).Options;
        _context = new MoveliDbContext(options);
        _context.Database.EnsureCreated();

        var category = new Category { Name = new LocalizedString("კ", "C"), Slug = "c" };
        var brand = new Brand { Name = "B", Slug = "b" };
        _context.AddRange(
            category,
            brand,
            new Product
            {
                Id = ProductId,
                Name = new LocalizedString("პროდუქტი", "Product"),
                Slug = "product",
                Price = 50m,
                StockQuantity = 10,
                IsActive = true,
                Category = category,
                Brand = brand
            },
            new Moveli.Domain.Entities.Cart { Id = CartId, UserId = UserId },
            new CartItem { Id = ItemId, CartId = CartId, ProductId = ProductId, Quantity = 1, UnitPrice = 50m });
        _context.SaveChanges();
        _context.ChangeTracker.Clear();

        var discountService = new Mock<IDiscountService>();
        discountService.Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(
                new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>()));

        _sut = new UpdateCartItemCommandHandler(
            new CartRepository(_context), new ProductRepository(_context), discountService.Object);
    }

    [Fact]
    public async Task Handle_UpdatingQuantity_SucceedsWithoutTrackingConflict()
    {
        var result = await _sut.Handle(
            new UpdateCartItemCommand(UserId, null, ItemId, 3), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_UpdatingQuantity_PersistsNewQuantity()
    {
        await _sut.Handle(new UpdateCartItemCommand(UserId, null, ItemId, 3), CancellationToken.None);

        var quantity = await _context.CartItems.AsNoTracking()
            .Where(i => i.Id == ItemId).Select(i => i.Quantity).SingleAsync();
        quantity.Should().Be(3);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
