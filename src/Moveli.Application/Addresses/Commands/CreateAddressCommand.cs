using FluentValidation;
using MediatR;
using Moveli.Application.Addresses.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Addresses.Commands;

public record CreateAddressCommand(
    Guid UserId,
    string FullName,
    string PhoneNumber,
    string City,
    string Street,
    string? PostalCode,
    bool IsDefault) : IRequest<Result<AddressDto>>;

public class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Street).NotEmpty().MaximumLength(500);
        RuleFor(x => x.PostalCode).MaximumLength(20);
    }
}

public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, Result<AddressDto>>
{
    private readonly IAddressRepository _addressRepository;

    public CreateAddressCommandHandler(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<Result<AddressDto>> Handle(CreateAddressCommand request, CancellationToken cancellationToken)
    {
        var existing = await _addressRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        var makeDefault = request.IsDefault || existing.Count == 0;

        if (makeDefault)
            await _addressRepository.ClearDefaultAsync(request.UserId, cancellationToken);

        var address = new Address
        {
            UserId = request.UserId,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            City = request.City,
            Street = request.Street,
            PostalCode = request.PostalCode,
            IsDefault = makeDefault
        };

        address = await _addressRepository.AddAsync(address, cancellationToken);

        return Result<AddressDto>.Success(new AddressDto(
            address.Id, address.FullName, address.PhoneNumber, address.City,
            address.Street, address.PostalCode, address.IsDefault, address.CreatedAt));
    }
}
