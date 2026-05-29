namespace Moveli.Application.Addresses.DTOs;

public record AddressDto(
    Guid Id,
    string FullName,
    string PhoneNumber,
    string City,
    string Street,
    string? PostalCode,
    bool IsDefault,
    DateTime CreatedAt);

public record CreateAddressRequest(
    string FullName,
    string PhoneNumber,
    string City,
    string Street,
    string? PostalCode,
    bool IsDefault);

public record UpdateAddressRequest(
    string FullName,
    string PhoneNumber,
    string City,
    string Street,
    string? PostalCode,
    bool IsDefault);
