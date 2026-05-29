using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Addresses.Commands;

public record SetDefaultAddressCommand(Guid Id, Guid UserId) : IRequest<Result>;

public class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand, Result>
{
    private readonly IAddressRepository _addressRepository;

    public SetDefaultAddressCommandHandler(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<Result> Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
    {
        var address = await _addressRepository.GetByIdAsync(request.Id, cancellationToken);
        if (address == null || address.UserId != request.UserId)
            return Result.Failure("Address not found.");

        await _addressRepository.ClearDefaultAsync(request.UserId, cancellationToken);

        address.IsDefault = true;
        await _addressRepository.UpdateAsync(address, cancellationToken);

        return Result.Success();
    }
}
