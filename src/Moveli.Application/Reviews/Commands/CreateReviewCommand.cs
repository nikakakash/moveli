using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Reviews.DTOs;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Reviews.Commands;

public record CreateReviewCommand(Guid ProductId, Guid UserId, int Rating, string? Comment) : IRequest<Result<ReviewDto>>;

public class CreateReviewCommandValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).MaximumLength(2000).When(x => x.Comment != null);
    }
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Result<ReviewDto>>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IProductRepository _productRepository;

    public CreateReviewCommandHandler(IReviewRepository reviewRepository, IProductRepository productRepository)
    {
        _reviewRepository = reviewRepository;
        _productRepository = productRepository;
    }

    public async Task<Result<ReviewDto>> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            return Result<ReviewDto>.Failure("Product not found.");

        var hasReviewed = await _reviewRepository.HasUserReviewedAsync(request.UserId, request.ProductId, cancellationToken);
        if (hasReviewed)
            return Result<ReviewDto>.Failure("You have already reviewed this product.");

        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = request.UserId,
            Rating = request.Rating,
            Comment = request.Comment,
            IsApproved = false // pending admin moderation
        };

        review = await _reviewRepository.AddAsync(review, cancellationToken);

        return Result<ReviewDto>.Success(new ReviewDto(
            review.Id, review.ProductId, review.UserId, review.Rating, review.Comment, review.IsApproved, review.CreatedAt));
    }
}
