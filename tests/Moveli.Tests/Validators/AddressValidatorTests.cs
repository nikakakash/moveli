using FluentValidation.TestHelper;
using Moveli.Application.Addresses.Commands;
using Xunit;

namespace Moveli.Tests.Validators;

public class CreateAddressCommandValidatorTests
{
    private readonly CreateAddressCommandValidator _validator = new();

    private static CreateAddressCommand Valid() =>
        new(Guid.NewGuid(), "Nika Test", "555123456", "თბილისი", "Rustaveli Ave 1", "0108", false);

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Passes_WhenPostalCodeNull()
    {
        _validator.TestValidate(Valid() with { PostalCode = null })
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Fails_WhenUserIdEmpty()
    {
        _validator.TestValidate(Valid() with { UserId = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.UserId);
    }

    [Fact]
    public void Fails_WhenFullNameEmpty()
    {
        _validator.TestValidate(Valid() with { FullName = "" })
            .ShouldHaveValidationErrorFor(x => x.FullName);
    }

    [Fact]
    public void Fails_WhenCityEmpty()
    {
        _validator.TestValidate(Valid() with { City = "" })
            .ShouldHaveValidationErrorFor(x => x.City);
    }

    [Fact]
    public void Fails_WhenStreetEmpty()
    {
        _validator.TestValidate(Valid() with { Street = "" })
            .ShouldHaveValidationErrorFor(x => x.Street);
    }

    [Fact]
    public void Fails_WhenPhoneNumberEmpty()
    {
        _validator.TestValidate(Valid() with { PhoneNumber = "" })
            .ShouldHaveValidationErrorFor(x => x.PhoneNumber);
    }
}
