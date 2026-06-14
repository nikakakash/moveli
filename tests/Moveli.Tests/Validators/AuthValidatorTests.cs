using FluentValidation.TestHelper;
using Moveli.Application.Auth.Commands;
using Xunit;

namespace Moveli.Tests.Validators;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator = new();

    private static RegisterCommand Valid() =>
        new("user@moveli.ge", "secret123", "Nika", "Test", "555123456", "en");

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    [InlineData("missing@")]
    public void Fails_ForInvalidEmail(string email)
    {
        _validator.TestValidate(Valid() with { Email = email })
            .ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")]   // < 8 chars
    [InlineData("1234567")] // 7 chars, still below the 8-char minimum
    public void Fails_ForWeakPassword(string password)
    {
        _validator.TestValidate(Valid() with { Password = password })
            .ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Passes_ForEightCharPassword()
    {
        _validator.TestValidate(Valid() with { Password = "12345678" })
            .ShouldNotHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Fails_WhenFirstNameEmpty()
    {
        _validator.TestValidate(Valid() with { FirstName = "" })
            .ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Theory]
    [InlineData("555123456")]      // 9 digits
    [InlineData("+995 555 123 456")] // 12 digits starting 995
    public void Passes_ForValidGeorgianPhone(string phone)
    {
        _validator.TestValidate(Valid() with { PhoneNumber = phone })
            .ShouldNotHaveValidationErrorFor(x => x.PhoneNumber);
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")]            // too short
    [InlineData("123456789012")]     // 12 digits but not 995 prefix
    public void Fails_ForInvalidPhone(string phone)
    {
        _validator.TestValidate(Valid() with { PhoneNumber = phone })
            .ShouldHaveValidationErrorFor(x => x.PhoneNumber);
    }
}

public class ResetPasswordCommandValidatorTests
{
    private readonly ResetPasswordCommandValidator _validator = new();

    private static ResetPasswordCommand Valid() =>
        new("user@moveli.ge", "reset-token", "secret123");

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("1234567")] // 7 chars, below the 8-char minimum
    public void Fails_ForWeakNewPassword(string password)
    {
        _validator.TestValidate(Valid() with { NewPassword = password })
            .ShouldHaveValidationErrorFor(x => x.NewPassword);
    }
}
