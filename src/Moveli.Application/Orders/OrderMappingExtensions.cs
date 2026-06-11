using Moveli.Application.Orders.DTOs;
using Moveli.Domain.Entities;

namespace Moveli.Application.Orders;

public static class OrderMappingExtensions
{
    /// <summary>
    /// Single source of truth for Order -> OrderDto. Requires Items and the owned
    /// ShippingAddress to be loaded.
    /// </summary>
    public static OrderDto ToDto(this Order order) => new(
        order.Id,
        order.OrderNumber,
        order.Status,
        order.ShippingAddress.FullName,
        order.ShippingAddress.PhoneNumber,
        order.ShippingAddress.City,
        order.ShippingAddress.Street,
        order.ShippingAddress.PostalCode,
        order.PaymentMethod,
        order.PaymentStatus,
        order.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.Total)).ToList(),
        order.SubTotal,
        order.ShippingCost,
        order.Discount,
        order.PromoCode,
        order.Total,
        order.CurrencyCode,
        order.Notes,
        order.CreatedAt);
}
