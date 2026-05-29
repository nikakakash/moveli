using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Addresses.Commands;

public record DeleteAddressCommand(Guid Id, Guid UserId) : IRequest<Result>;

public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand, Result>
{
    private readonly IAddressRepository _addressRepository;

    public DeleteAddressCommandHandler(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<Result> Handle(DeleteAddressCommand request, CancellationToken cancellationToken)
    {
        var address = await _addressRepository.GetByIdAsync(request.Id, cancellationToken);
        if (address == null || address.UserId != request.UserId)
            return Result.Failure("Address not found.");

        var wasDefault = address.IsDefault;
        await _addressRepository.DeleteAsync(address, cancellationToken);

        // Promote another address to default if we removed the default one
        if (wasDefault)
        {
            var remaining = await _addressRepository.GetByUserIdAsync(request.UserId, cancellationToken);
            var next = remaining.FirstOrDefault();
            if (next != null)
            {
                next.IsDefault = true;
                await _addressRepository.UpdateAsync(next, cancellationToken);
            }
        }

        return Result.Success();
    }
}
