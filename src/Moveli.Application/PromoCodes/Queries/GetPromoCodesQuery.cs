using MediatR;
using Moveli.Application.Common;
using Moveli.Application.PromoCodes.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Queries;

public record GetPromoCodesQuery(int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<PromoCodeDto>>>;

public class GetPromoCodesQueryHandler : IRequestHandler<GetPromoCodesQuery, Result<PagedResult<PromoCodeDto>>>
{
    private readonly IPromoCodeRepository _repository;

    public GetPromoCodesQueryHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<PromoCodeDto>>> Handle(GetPromoCodesQuery request, CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (promoCodes, total) = await _repository.GetPagedAsync(page, pageSize, cancellationToken);
        var redemptionCounts = await _repository.GetRedemptionCountsAsync(cancellationToken);

        var dtos = promoCodes.Select(p => new PromoCodeDto(
            p.Id,
            p.Code,
            p.Type,
            p.Value,
            p.IsActive,
            p.StartsAt,
            p.EndsAt,
            p.MaxRedemptions,
            redemptionCounts.GetValueOrDefault(p.Id))).ToList();

        return Result<PagedResult<PromoCodeDto>>.Success(
            new PagedResult<PromoCodeDto>(dtos, total, page, pageSize));
    }
}
