using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Orders.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Orders.Queries;

public record GetOrderDetailQuery(Guid OrderId, Guid? UserId = null) : IRequest<Result<OrderDto>>;

public class GetOrderDetailQueryHandler : IRequestHandler<GetOrderDetailQuery, Result<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderDetailQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderDetailQuery request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null)
            return Result<OrderDto>.Failure("Order not found.");

        if (request.UserId.HasValue && order.UserId != request.UserId.Value)
            return Result<OrderDto>.Failure("Order not found.");

        return Result<OrderDto>.Success(new OrderDto(
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
            order.CreatedAt));
    }
}
