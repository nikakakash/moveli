using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Reviews.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Reviews.Queries;

public record GetAdminReviewsQuery(
    int Page = 1,
    int PageSize = 20,
    bool? IsApproved = null) : IRequest<Result<PagedResult<AdminReviewDto>>>;

public class GetAdminReviewsQueryHandler : IRequestHandler<GetAdminReviewsQuery, Result<PagedResult<AdminReviewDto>>>
{
    private readonly IReviewRepository _reviewRepository;

    public GetAdminReviewsQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<Result<PagedResult<AdminReviewDto>>> Handle(GetAdminReviewsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _reviewRepository.GetAllAsync(
            request.Page, request.PageSize, request.IsApproved, cancellationToken);

        var userIds = items.Select(r => r.UserId).Distinct().ToList();
        var users = await _reviewRepository.GetUserBriefsAsync(userIds, cancellationToken);

        var dtos = items.Select(r =>
        {
            users.TryGetValue(r.UserId, out var u);
            return new AdminReviewDto(
                r.Id,
                r.ProductId,
                r.Product?.Name.En ?? "(deleted)",
                r.Product?.Slug,
                r.UserId,
                u?.FullName ?? "(unknown)",
                u?.Email ?? string.Empty,
                r.Rating,
                r.Comment,
                r.IsApproved,
                r.CreatedAt);
        }).ToList();

        return Result<PagedResult<AdminReviewDto>>.Success(
            new PagedResult<AdminReviewDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}
