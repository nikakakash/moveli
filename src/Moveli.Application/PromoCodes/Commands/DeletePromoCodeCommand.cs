using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Commands;

public record DeletePromoCodeCommand(Guid Id) : IRequest<Result>;

public class DeletePromoCodeCommandHandler : IRequestHandler<DeletePromoCodeCommand, Result>
{
    private readonly IPromoCodeRepository _repository;

    public DeletePromoCodeCommandHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeletePromoCodeCommand request, CancellationToken cancellationToken)
    {
        var promo = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (promo == null)
            return Result.Failure("Promo code not found.");

        await _repository.DeleteAsync(promo, cancellationToken);
        return Result.Success();
    }
}
