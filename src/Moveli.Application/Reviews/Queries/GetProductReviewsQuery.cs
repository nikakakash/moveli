using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Reviews.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Reviews.Queries;

public record GetProductReviewsQuery(Guid ProductId, int Page = 1, int PageSize = 10) : IRequest<Result<PagedResult<ReviewDto>>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, Result<PagedResult<ReviewDto>>>
{
    private readonly IReviewRepository _reviewRepository;

    public GetProductReviewsQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<Result<PagedResult<ReviewDto>>> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _reviewRepository.GetByProductIdAsync(
            request.ProductId, page, pageSize, cancellationToken);

        var dtos = items.Select(r => new ReviewDto(
            r.Id, r.ProductId, r.UserId, r.Rating, r.Comment, r.IsApproved, r.CreatedAt)).ToList();

        return Result<PagedResult<ReviewDto>>.Success(
            new PagedResult<ReviewDto>(dtos, totalCount, page, pageSize));
    }
}
