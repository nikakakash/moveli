namespace Moveli.Domain.ValueObjects;

public class ShippingAddress
{
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
}
