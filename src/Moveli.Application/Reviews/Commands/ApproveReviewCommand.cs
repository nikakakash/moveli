using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Reviews.Commands;

public record ApproveReviewCommand(Guid Id, bool Approve) : IRequest<Result>;

public class ApproveReviewCommandHandler : IRequestHandler<ApproveReviewCommand, Result>
{
    private readonly IReviewRepository _reviewRepository;

    public ApproveReviewCommandHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<Result> Handle(ApproveReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.Id, cancellationToken);
        if (review == null)
            return Result.Failure("Review not found.");

        review.IsApproved = request.Approve;
        await _reviewRepository.UpdateAsync(review, cancellationToken);
        await _reviewRepository.RecomputeProductRatingAsync(review.ProductId, cancellationToken);

        return Result.Success();
    }
}
