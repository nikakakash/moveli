using FluentValidation.TestHelper;
using Moveli.Application.Reviews.Commands;
using Xunit;

namespace Moveli.Tests.Validators;

public class CreateReviewCommandValidatorTests
{
    private readonly CreateReviewCommandValidator _validator = new();

    private static CreateReviewCommand Valid() =>
        new(Guid.NewGuid(), Guid.NewGuid(), 5, "Great product");

    [Fact]
    public void Passes_ForValidCommand()
    {
        _validator.TestValidate(Valid()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Passes_WhenCommentNull()
    {
        _validator.TestValidate(Valid() with { Comment = null })
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Fails_WhenProductIdEmpty()
    {
        _validator.TestValidate(Valid() with { ProductId = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.ProductId);
    }

    [Fact]
    public void Fails_WhenUserIdEmpty()
    {
        _validator.TestValidate(Valid() with { UserId = Guid.Empty })
            .ShouldHaveValidationErrorFor(x => x.UserId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    public void Fails_WhenRatingOutOfRange(int rating)
    {
        _validator.TestValidate(Valid() with { Rating = rating })
            .ShouldHaveValidationErrorFor(x => x.Rating);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(5)]
    public void Passes_ForRatingsInRange(int rating)
    {
        _validator.TestValidate(Valid() with { Rating = rating })
            .ShouldNotHaveValidationErrorFor(x => x.Rating);
    }

    [Fact]
    public void Fails_WhenCommentTooLong()
    {
        _validator.TestValidate(Valid() with { Comment = new string('x', 2001) })
            .ShouldHaveValidationErrorFor(x => x.Comment);
    }
}
