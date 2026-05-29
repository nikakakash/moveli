using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Reviews.Commands;

public record DeleteReviewCommand(Guid Id) : IRequest<Result>;

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, Result>
{
    private readonly IReviewRepository _reviewRepository;

    public DeleteReviewCommandHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<Result> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.Id, cancellationToken);
        if (review == null)
            return Result.Failure("Review not found.");

        var productId = review.ProductId;
        await _reviewRepository.DeleteAsync(review, cancellationToken);
        await _reviewRepository.RecomputeProductRatingAsync(productId, cancellationToken);

        return Result.Success();
    }
}
