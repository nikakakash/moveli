using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts.Commands;

public record DeleteDiscountCommand(Guid Id) : IRequest<Result>;

public class DeleteDiscountCommandHandler : IRequestHandler<DeleteDiscountCommand, Result>
{
    private readonly IDiscountRepository _discountRepository;

    public DeleteDiscountCommandHandler(IDiscountRepository discountRepository)
    {
        _discountRepository = discountRepository;
    }

    public async Task<Result> Handle(DeleteDiscountCommand request, CancellationToken cancellationToken)
    {
        var discount = await _discountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (discount == null)
            return Result.Failure("Discount not found.");

        await _discountRepository.DeleteAsync(discount, cancellationToken);
        return Result.Success();
    }
}
