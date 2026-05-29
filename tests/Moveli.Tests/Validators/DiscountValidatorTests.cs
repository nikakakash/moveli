using FluentValidation.TestHelper;
using Moveli.Application.Discounts.Commands;
using Xunit;

namespace Moveli.Tests.Validators;

public class CreateDiscountCommandValidatorTests
{
    private readonly CreateDiscountCommandValidator _validator = new();

    private static CreateDiscountCommand Valid() =>
        new("Product", Guid.NewGuid(), 10, true, null, null);

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("Product")]
    [InlineData("category")]
    [InlineData("Brand")]
    public void Passes_ForKnownScopes(string scope)
    {
        _validator.TestValidate(Valid() with { Scope = scope })
            .ShouldNotHaveValidationErrorFor(x => x.Scope);
    }

    [Fact]
    public void Fails_WhenScopeUnknown()
    {
        _validator.TestValidate(Valid() with { Scope = "Galaxy" })
            .ShouldHaveValidationErrorFor(x => x.Scope);
    }

    [Fact]
    public void Fails_WhenTargetIdEmpty()
    {
        _validator.TestValidate(Valid() with { TargetId = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.TargetId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(101)]
    public void Fails_WhenPercentageOutOfRange(decimal pct)
    {
        _validator.TestValidate(Valid() with { Percentage = pct })
            .ShouldHaveValidationErrorFor(x => x.Percentage);
    }

    [Fact]
    public void Fails_WhenEndsBeforeStarts()
    {
        var now = DateTime.UtcNow;
        _validator.TestValidate(Valid() with { StartsAt = now, EndsAt = now.AddHours(-1) })
            .ShouldHaveValidationErrorFor(x => x.EndsAt);
    }
}
