using FluentValidation.TestHelper;
using Moveli.Application.Products.Commands;
using Xunit;

namespace Moveli.Tests.Validators;

public class CreateProductCommandValidatorTests
{
    private readonly CreateProductCommandValidator _validator = new();

    private static CreateProductCommand Valid() => new(
        NameKa: "სახელი",
        NameEn: "Name",
        Slug: "valid-slug-123",
        DescriptionKa: "აღწერა",
        DescriptionEn: "Description",
        SKU: "SKU-1",
        Price: 49.99m,
        CompareAtPrice: 59.99m,
        CategoryId: Guid.NewGuid(),
        BrandId: Guid.NewGuid(),
        StockQuantity: 10,
        IsActive: true,
        IsFeatured: false,
        ImageUrls: new List<string> { "https://img/1.jpg" });

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Fails_WhenNameKaEmpty()
    {
        _validator.TestValidate(Valid() with { NameKa = "" })
            .ShouldHaveValidationErrorFor(x => x.NameKa);
    }

    [Fact]
    public void Fails_WhenNameEnEmpty()
    {
        _validator.TestValidate(Valid() with { NameEn = "" })
            .ShouldHaveValidationErrorFor(x => x.NameEn);
    }

    [Theory]
    [InlineData("Bad Slug")]
    [InlineData("UPPER")]
    [InlineData("trailing-")]
    [InlineData("under_score")]
    public void Fails_ForInvalidSlug(string slug)
    {
        _validator.TestValidate(Valid() with { Slug = slug })
            .ShouldHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Fails_WhenPriceNotPositive()
    {
        _validator.TestValidate(Valid() with { Price = 0 })
            .ShouldHaveValidationErrorFor(x => x.Price);
    }

    [Fact]
    public void Fails_WhenCompareAtPriceNotPositive()
    {
        _validator.TestValidate(Valid() with { CompareAtPrice = 0 })
            .ShouldHaveValidationErrorFor(x => x.CompareAtPrice);
    }

    [Fact]
    public void Passes_WhenCompareAtPriceNull()
    {
        _validator.TestValidate(Valid() with { CompareAtPrice = null })
            .ShouldNotHaveValidationErrorFor(x => x.CompareAtPrice);
    }

    [Fact]
    public void Fails_WhenStockNegative()
    {
        _validator.TestValidate(Valid() with { StockQuantity = -1 })
            .ShouldHaveValidationErrorFor(x => x.StockQuantity);
    }

    [Fact]
    public void Fails_WhenCategoryIdEmpty()
    {
        _validator.TestValidate(Valid() with { CategoryId = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.CategoryId);
    }
}
