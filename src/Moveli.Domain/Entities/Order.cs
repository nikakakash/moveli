using Moveli.Domain.Enums;
using Moveli.Domain.ValueObjects;

namespace Moveli.Domain.Entities;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public ShippingAddress ShippingAddress { get; set; } = new();

    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public string CurrencyCode { get; set; } = "GEL";
    public string? Notes { get; set; }
    public string? PromoCode { get; set; }
}
