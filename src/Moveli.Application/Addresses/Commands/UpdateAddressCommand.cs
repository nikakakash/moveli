using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Addresses.Commands;

public record UpdateAddressCommand(
    Guid Id,
    Guid UserId,
    string FullName,
    string PhoneNumber,
    string City,
    string Street,
    string? PostalCode,
    bool IsDefault) : IRequest<Result>;

public class UpdateAddressCommandValidator : AbstractValidator<UpdateAddressCommand>
{
    public UpdateAddressCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Street).NotEmpty().MaximumLength(500);
        RuleFor(x => x.PostalCode).MaximumLength(20);
    }
}

public class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand, Result>
{
    private readonly IAddressRepository _addressRepository;

    public UpdateAddressCommandHandler(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<Result> Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
    {
        var address = await _addressRepository.GetByIdAsync(request.Id, cancellationToken);
        if (address == null || address.UserId != request.UserId)
            return Result.Failure("Address not found.");

        if (request.IsDefault && !address.IsDefault)
            await _addressRepository.ClearDefaultAsync(request.UserId, cancellationToken);

        address.FullName = request.FullName;
        address.PhoneNumber = request.PhoneNumber;
        address.City = request.City;
        address.Street = request.Street;
        address.PostalCode = request.PostalCode;
        address.IsDefault = request.IsDefault || address.IsDefault;

        await _addressRepository.UpdateAsync(address, cancellationToken);

        return Result.Success();
    }
}
