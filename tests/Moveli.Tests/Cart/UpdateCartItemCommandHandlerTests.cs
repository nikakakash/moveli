using FluentAssertions;
using Moq;
using Moveli.Application.Cart.Commands;
using Moveli.Application.Discounts;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;
using Xunit;

namespace Moveli.Tests.Carts;

public class UpdateCartItemCommandHandlerTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid ProductId = Guid.NewGuid();
    private static readonly Guid ItemId = Guid.NewGuid();

    private readonly Mock<ICartRepository> _cartRepository = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IDiscountService> _discountService = new();
    private readonly UpdateCartItemCommandHandler _sut;

    public UpdateCartItemCommandHandlerTests()
    {
        var product = new Product
        {
            Id = ProductId,
            Name = new LocalizedString("პროდუქტი", "Product"),
            Slug = "product",
            Price = 100m,
            StockQuantity = 10,
            IsActive = true
        };

        var cart = new Moveli.Domain.Entities.Cart
        {
            UserId = UserId,
            Items = new List<CartItem>
            {
                // Stale display price captured at add-to-cart time (no discount then).
                new() { Id = ItemId, ProductId = ProductId, Quantity = 1, UnitPrice = 100m }
            }
        };

        _cartRepository.Setup(r => r.GetByUserIdAsync(UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cart);
        _productRepository.Setup(r => r.GetByIdAsync(ProductId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        // A 20% live discount on the product → effective price 80.
        _discountService.Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(
                new Dictionary<Guid, decimal> { [ProductId] = 20m },
                new Dictionary<Guid, decimal>(),
                new Dictionary<Guid, decimal>()));

        _sut = new UpdateCartItemCommandHandler(
            _cartRepository.Object, _productRepository.Object, _discountService.Object);
    }

    [Fact]
    public async Task Handle_WithActiveDiscount_RefreshesUnitPriceToDiscountedPrice()
    {
        CartItem? saved = null;
        _cartRepository.Setup(r => r.UpdateItemAsync(It.IsAny<CartItem>(), It.IsAny<CancellationToken>()))
            .Callback<CartItem, CancellationToken>((i, _) => saved = i)
            .Returns(Task.CompletedTask);

        await _sut.Handle(new UpdateCartItemCommand(UserId, null, ItemId, 5), CancellationToken.None);

        saved!.UnitPrice.Should().Be(80m);
    }

    [Fact]
    public async Task Handle_WithActiveDiscount_UpdatesQuantity()
    {
        CartItem? saved = null;
        _cartRepository.Setup(r => r.UpdateItemAsync(It.IsAny<CartItem>(), It.IsAny<CancellationToken>()))
            .Callback<CartItem, CancellationToken>((i, _) => saved = i)
            .Returns(Task.CompletedTask);

        await _sut.Handle(new UpdateCartItemCommand(UserId, null, ItemId, 5), CancellationToken.None);

        saved!.Quantity.Should().Be(5);
    }

    [Fact]
    public async Task Handle_WhenRequestedQuantityExceedsStock_Fails()
    {
        var result = await _sut.Handle(
            new UpdateCartItemCommand(UserId, null, ItemId, 11), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
    }
}
