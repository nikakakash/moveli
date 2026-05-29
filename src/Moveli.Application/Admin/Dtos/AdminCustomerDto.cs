using Moveli.Domain.Enums;

namespace Moveli.Application.Admin.DTOs;

public record AdminCustomerDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string PreferredLanguage,
    DateTime CreatedAt,
    int OrderCount,
    decimal TotalSpent);

public record AdminCustomerDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string PreferredLanguage,
    DateTime CreatedAt,
    int OrderCount,
    decimal TotalSpent,
    List<CustomerOrderDto> RecentOrders);

public record CustomerOrderDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal Total,
    DateTime CreatedAt);
