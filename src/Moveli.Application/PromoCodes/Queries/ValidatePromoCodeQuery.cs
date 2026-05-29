using MediatR;
using Moveli.Application.Common;
using Moveli.Application.PromoCodes;
using Moveli.Application.PromoCodes.Dtos;

namespace Moveli.Application.PromoCodes.Queries;

public record ValidatePromoCodeQuery(string Code, decimal Subtotal, Guid UserId)
    : IRequest<Result<ValidatePromoResult>>;

public class ValidatePromoCodeQueryHandler
    : IRequestHandler<ValidatePromoCodeQuery, Result<ValidatePromoResult>>
{
    private readonly IPromoCodeService _service;

    public ValidatePromoCodeQueryHandler(IPromoCodeService service)
    {
        _service = service;
    }

    public async Task<Result<ValidatePromoResult>> Handle(
        ValidatePromoCodeQuery request, CancellationToken cancellationToken)
    {
        var result = await _service.ValidateAsync(
            request.Code, request.Subtotal, request.UserId, cancellationToken);

        if (!result.IsSuccess)
            return Result<ValidatePromoResult>.Failure(result.Error!);

        return Result<ValidatePromoResult>.Success(
            new ValidatePromoResult(result.Value!.Code, result.Value.DiscountAmount));
    }
}
