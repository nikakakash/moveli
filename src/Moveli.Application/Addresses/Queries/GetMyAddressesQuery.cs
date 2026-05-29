using MediatR;
using Moveli.Application.Addresses.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Addresses.Queries;

public record GetMyAddressesQuery(Guid UserId) : IRequest<Result<List<AddressDto>>>;

public class GetMyAddressesQueryHandler : IRequestHandler<GetMyAddressesQuery, Result<List<AddressDto>>>
{
    private readonly IAddressRepository _addressRepository;

    public GetMyAddressesQueryHandler(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<Result<List<AddressDto>>> Handle(GetMyAddressesQuery request, CancellationToken cancellationToken)
    {
        var items = await _addressRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        var dtos = items.Select(a => new AddressDto(
            a.Id, a.FullName, a.PhoneNumber, a.City, a.Street, a.PostalCode, a.IsDefault, a.CreatedAt)).ToList();

        return Result<List<AddressDto>>.Success(dtos);
    }
}
