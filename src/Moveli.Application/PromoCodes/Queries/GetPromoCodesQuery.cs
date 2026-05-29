using MediatR;
using Moveli.Application.Common;
using Moveli.Application.PromoCodes.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Queries;

public record GetPromoCodesQuery : IRequest<Result<List<PromoCodeDto>>>;

public class GetPromoCodesQueryHandler : IRequestHandler<GetPromoCodesQuery, Result<List<PromoCodeDto>>>
{
    private readonly IPromoCodeRepository _repository;

    public GetPromoCodesQueryHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<PromoCodeDto>>> Handle(GetPromoCodesQuery request, CancellationToken cancellationToken)
    {
        var promoCodes = await _repository.GetAllAsync(cancellationToken);
        var redemptionCounts = await _repository.GetRedemptionCountsAsync(cancellationToken);

        var dtos = new List<PromoCodeDto>(promoCodes.Count);
        foreach (var p in promoCodes)
        {
            dtos.Add(new PromoCodeDto(
                p.Id,
                p.Code,
                p.Type,
                p.Value,
                p.IsActive,
                p.StartsAt,
                p.EndsAt,
                redemptionCounts.GetValueOrDefault(p.Id)));
        }

        return Result<List<PromoCodeDto>>.Success(dtos);
    }
}
