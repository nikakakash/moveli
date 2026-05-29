using FluentAssertions;
using Moq;
using Moveli.API.Infrastructure.PromoCodes;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;
using Xunit;

namespace Moveli.Tests.Services;

public class PromoCodeServiceTests
{
    private readonly Mock<IPromoCodeRepository> _repo = new();
    private readonly PromoCodeService _sut;
    private static readonly Guid UserId = Guid.NewGuid();

    public PromoCodeServiceTests()
    {
        _sut = new PromoCodeService(_repo.Object);
    }

    private static PromoCode LivePercentage(decimal value = 15) => new()
    {
        Code = "SAVE15",
        Type = PromoDiscountType.Percentage,
        Value = value,
        IsActive = true
    };

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateAsync_Fails_WhenCodeBlank(string? code)
    {
        var result = await _sut.ValidateAsync(code!, 100, UserId);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Promo code is invalid.");
        _repo.Verify(r => r.GetByCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ValidateAsync_Fails_WhenCodeNotFound()
    {
        _repo.Setup(r => r.GetByCodeAsync("NOPE", It.IsAny<CancellationToken>()))
            .ReturnsAsync((PromoCode?)null);

        var result = await _sut.ValidateAsync("NOPE", 100, UserId);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Promo code is invalid.");
    }

    [Fact]
    public async Task ValidateAsync_Fails_WhenNotLive()
    {
        var promo = LivePercentage();
        promo.IsActive = false;
        _repo.Setup(r => r.GetByCodeAsync("SAVE15", It.IsAny<CancellationToken>())).ReturnsAsync(promo);

        var result = await _sut.ValidateAsync("SAVE15", 100, UserId);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("This promo code is expired or inactive.");
    }

    [Fact]
    public async Task ValidateAsync_Fails_WhenAlreadyRedeemed()
    {
        var promo = LivePercentage();
        _repo.Setup(r => r.GetByCodeAsync("SAVE15", It.IsAny<CancellationToken>())).ReturnsAsync(promo);
        _repo.Setup(r => r.HasUserRedeemedAsync(promo.Id, UserId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await _sut.ValidateAsync("SAVE15", 100, UserId);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("You have already used this promo code.");
    }

    [Fact]
    public async Task ValidateAsync_Succeeds_AndComputesPercentageDiscount()
    {
        var promo = LivePercentage(15);
        _repo.Setup(r => r.GetByCodeAsync("SAVE15", It.IsAny<CancellationToken>())).ReturnsAsync(promo);
        _repo.Setup(r => r.HasUserRedeemedAsync(promo.Id, UserId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _sut.ValidateAsync("SAVE15", 90, UserId);

        result.IsSuccess.Should().BeTrue();
        result.Value!.PromoCodeId.Should().Be(promo.Id);
        result.Value.Code.Should().Be("SAVE15");
        result.Value.DiscountAmount.Should().Be(13.5m);
    }

    [Fact]
    public async Task ValidateAsync_Succeeds_AndCapsFixedDiscountAtSubtotal()
    {
        var promo = new PromoCode { Code = "BIG", Type = PromoDiscountType.FixedAmount, Value = 80, IsActive = true };
        _repo.Setup(r => r.GetByCodeAsync("BIG", It.IsAny<CancellationToken>())).ReturnsAsync(promo);
        _repo.Setup(r => r.HasUserRedeemedAsync(promo.Id, UserId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var result = await _sut.ValidateAsync("BIG", 50, UserId);

        result.IsSuccess.Should().BeTrue();
        result.Value!.DiscountAmount.Should().Be(50m);
    }
}
