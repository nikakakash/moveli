using FluentValidation.TestHelper;
using Moveli.Application.PromoCodes.Commands;
using Xunit;

namespace Moveli.Tests.Validators;

public class CreatePromoCodeCommandValidatorTests
{
    private readonly CreatePromoCodeCommandValidator _validator = new();

    private static CreatePromoCodeCommand Valid() =>
        new("SAVE10", "Percentage", 10, true, null, null);

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Fails_WhenCodeEmpty()
    {
        _validator.TestValidate(Valid() with { Code = "" })
            .ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Fails_WhenCodeTooLong()
    {
        _validator.TestValidate(Valid() with { Code = new string('A', 51) })
            .ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Fails_WhenTypeUnknown()
    {
        _validator.TestValidate(Valid() with { Type = "Bogus" })
            .ShouldHaveValidationErrorFor(x => x.Type);
    }

    [Theory]
    [InlineData("Percentage")]
    [InlineData("percentage")]
    [InlineData("FixedAmount")]
    public void Passes_ForKnownTypesCaseInsensitive(string type)
    {
        var cmd = Valid() with { Type = type };
        _validator.TestValidate(cmd).ShouldNotHaveValidationErrorFor(x => x.Type);
    }

    [Fact]
    public void Fails_WhenValueNotPositive()
    {
        _validator.TestValidate(Valid() with { Value = 0 })
            .ShouldHaveValidationErrorFor(x => x.Value);
    }

    [Fact]
    public void Fails_WhenPercentageValueAbove100()
    {
        _validator.TestValidate(Valid() with { Type = "Percentage", Value = 150 })
            .ShouldHaveValidationErrorFor(x => x.Value);
    }

    [Fact]
    public void Passes_WhenFixedValueAbove100()
    {
        _validator.TestValidate(Valid() with { Type = "FixedAmount", Value = 150 })
            .ShouldNotHaveValidationErrorFor(x => x.Value);
    }

    [Fact]
    public void Fails_WhenEndsBeforeStarts()
    {
        var now = DateTime.UtcNow;
        _validator.TestValidate(Valid() with { StartsAt = now, EndsAt = now.AddDays(-1) })
            .ShouldHaveValidationErrorFor(x => x.EndsAt);
    }
}

public class UpdatePromoCodeCommandValidatorTests
{
    private readonly UpdatePromoCodeCommandValidator _validator = new();

    private static UpdatePromoCodeCommand Valid() =>
        new(Guid.NewGuid(), "SAVE10", "Percentage", 10, true, null, null);

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Fails_WhenIdEmpty()
    {
        _validator.TestValidate(Valid() with { Id = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Fact]
    public void Fails_WhenPercentageValueAbove100()
    {
        _validator.TestValidate(Valid() with { Value = 150 })
            .ShouldHaveValidationErrorFor(x => x.Value);
    }
}
