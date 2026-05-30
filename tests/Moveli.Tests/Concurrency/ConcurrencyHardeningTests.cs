using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Repositories;
using Moveli.Application.Cart.Commands;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;
using Xunit;

namespace Moveli.Tests.Concurrency;

public class ConcurrencyHardeningTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly MoveliDbContext _context;

    public ConcurrencyHardeningTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        _context = new MoveliDbContext(
            new DbContextOptionsBuilder<MoveliDbContext>().UseSqlite(_connection).Options);
        _context.Database.EnsureCreated();
    }

    private (Guid CartId, Guid ProductId) SeedCartAndProduct()
    {
        var category = new Category { Name = new LocalizedString("k", "C"), Slug = "c" };
        var brand = new Brand { Name = "B", Slug = "b" };
        var product = new Product
        {
            Name = new LocalizedString("p", "P"), Slug = "p", Price = 10m,
            StockQuantity = 100, IsActive = true, Category = category, Brand = brand
        };
        var cart = new Cart { UserId = Guid.NewGuid() };
        _context.AddRange(category, brand, product, cart);
        _context.SaveChanges();
        _context.ChangeTracker.Clear();
        return (cart.Id, product.Id);
    }

    [Fact]
    public async Task CartRepository_AddItem_DuplicateProduct_ThrowsDuplicateEntity()
    {
        var (cartId, productId) = SeedCartAndProduct();
        var repo = new CartRepository(_context);
        await repo.AddItemAsync(new CartItem { CartId = cartId, ProductId = productId, Quantity = 1, UnitPrice = 10m });
        _context.ChangeTracker.Clear();

        var act = () => repo.AddItemAsync(new CartItem { CartId = cartId, ProductId = productId, Quantity = 1, UnitPrice = 10m });

        await act.Should().ThrowAsync<DuplicateEntityException>();
    }

    [Fact]
    public async Task ReviewRepository_Add_DuplicateUserProduct_ThrowsDuplicateEntity()
    {
        var (_, productId) = SeedCartAndProduct();
        var userId = Guid.NewGuid();
        var repo = new ReviewRepository(_context);
        await repo.AddAsync(new Review { ProductId = productId, UserId = userId, Rating = 5 });
        _context.ChangeTracker.Clear();

        var act = () => repo.AddAsync(new Review { ProductId = productId, UserId = userId, Rating = 4 });

        await act.Should().ThrowAsync<DuplicateEntityException>();
    }

    [Fact]
    public async Task WishlistRepository_Add_DuplicateUserProduct_ThrowsDuplicateEntity()
    {
        var (_, productId) = SeedCartAndProduct();
        var userId = Guid.NewGuid();
        var repo = new WishlistRepository(_context);
        await repo.AddAsync(new Wishlist { ProductId = productId, UserId = userId });
        _context.ChangeTracker.Clear();

        var act = () => repo.AddAsync(new Wishlist { ProductId = productId, UserId = userId });

        await act.Should().ThrowAsync<DuplicateEntityException>();
    }

    [Fact]
    public async Task AddressRepository_SetDefault_LeavesExactlyOneDefault()
    {
        var userId = Guid.NewGuid();
        var a1 = new Address { UserId = userId, FullName = "A", PhoneNumber = "1", City = "x", Street = "y", IsDefault = true };
        var a2 = new Address { UserId = userId, FullName = "B", PhoneNumber = "2", City = "x", Street = "y", IsDefault = false };
        _context.AddRange(a1, a2);
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var repo = new AddressRepository(_context);
        await repo.SetDefaultAsync(userId, a2.Id);

        var defaults = await _context.Addresses.AsNoTracking()
            .Where(a => a.UserId == userId && a.IsDefault).Select(a => a.Id).ToListAsync();
        defaults.Should().ContainSingle().Which.Should().Be(a2.Id);
    }

    [Fact]
    public async Task AddCartItem_WhenConcurrentInsertConflicts_MergesIntoExistingRow()
    {
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var product = new Product
        {
            Id = productId, Name = new LocalizedString("p", "P"), Slug = "p",
            Price = 10m, StockQuantity = 100, IsActive = true
        };

        var productRepo = new Mock<IProductRepository>();
        productRepo.Setup(r => r.GetByIdAsync(productId, It.IsAny<CancellationToken>())).ReturnsAsync(product);

        var discounts = new Mock<IDiscountService>();
        discounts.Setup(d => d.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(
                new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>(), new Dictionary<Guid, decimal>()));

        var staleCart = new Cart { Id = Guid.NewGuid(), UserId = userId, Items = new List<CartItem>() };
        var existing = new CartItem { ProductId = productId, Quantity = 2, UnitPrice = 10m, Product = product };
        var refreshedCart = new Cart { Id = staleCart.Id, UserId = userId, Items = new List<CartItem> { existing } };

        var cartRepo = new Mock<ICartRepository>();
        cartRepo.SetupSequence(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(staleCart)      // first read: item not yet visible
            .ReturnsAsync(refreshedCart); // reload inside the catch
        cartRepo.Setup(r => r.AddItemAsync(It.IsAny<CartItem>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new DuplicateEntityException("Item already in cart."));
        CartItem? merged = null;
        cartRepo.Setup(r => r.UpdateItemAsync(It.IsAny<CartItem>(), It.IsAny<CancellationToken>()))
            .Callback<CartItem, CancellationToken>((i, _) => merged = i)
            .Returns(Task.CompletedTask);

        var handler = new AddCartItemCommandHandler(cartRepo.Object, productRepo.Object, discounts.Object);

        var result = await handler.Handle(new AddCartItemCommand(userId, null, productId, 3), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        merged.Should().NotBeNull();
        merged!.Quantity.Should().Be(5); // existing 2 + requested 3
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
