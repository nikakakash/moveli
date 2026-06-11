using FluentAssertions;
using Moq;
using Moveli.Application.Discounts;
using Moveli.Application.Wishlists.Queries;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;
using Xunit;

namespace Moveli.Tests.Wishlists;

public class GetWishlistQueryTests
{
    [Fact]
    public async Task Handle_AppliesDiscountSnapshot_ToWishlistProductPricing()
    {
        var productId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var product = new Product
        {
            Id = productId,
            Name = new LocalizedString("პ", "P"),
            Slug = "p",
            Price = 100m,
            Category = new Category { Name = new LocalizedString("კ", "C"), Slug = "c" },
            Brand = new Brand { Name = "B", Slug = "b" }
        };

        var wishlistRepo = new Mock<IWishlistRepository>();
        wishlistRepo.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Wishlist>
            {
                new() { Id = Guid.NewGuid(), UserId = userId, ProductId = productId, Product = product }
            });

        var discounts = new Mock<IDiscountService>();
        discounts.Setup(s => s.CreateSnapshotAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DiscountSnapshot(
                new Dictionary<Guid, decimal> { [productId] = 25m },
                new Dictionary<Guid, decimal>(),
                new Dictionary<Guid, decimal>()));

        var handler = new GetWishlistQueryHandler(wishlistRepo.Object, discounts.Object);
        var result = await handler.Handle(new GetWishlistQuery(userId), CancellationToken.None);

        var item = result.Value!.Single();
        item.Product.Price.Should().Be(75m);            // 100 − 25%
        item.Product.CompareAtPrice.Should().Be(100m);  // original price shown struck-through
    }
}
