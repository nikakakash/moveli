using Moveli.Domain.Enums;

namespace Moveli.Application.Orders.DTOs;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    string ShippingFullName,
    string ShippingPhoneNumber,
    string ShippingCity,
    string ShippingStreet,
    string? ShippingPostalCode,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    List<OrderItemDto> Items,
    decimal SubTotal,
    decimal ShippingCost,
    decimal Discount,
    string? PromoCode,
    decimal Total,
    string CurrencyCode,
    string? Notes,
    DateTime CreatedAt);

public record OrderListDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    string ShippingFullName,
    string ShippingPhoneNumber,
    string ShippingCity,
    string ShippingStreet,
    string? ShippingPostalCode,
    decimal Total,
    string CurrencyCode,
    int ItemCount,
    DateTime CreatedAt);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal Total);

public record CreateOrderRequest(
    string ShippingFullName,
    string ShippingPhoneNumber,
    string ShippingCity,
    string ShippingStreet,
    string? ShippingPostalCode,
    PaymentMethod PaymentMethod,
    string? Notes,
    string? PromoCode);

public record UpdateOrderStatusRequest(OrderStatus Status);
