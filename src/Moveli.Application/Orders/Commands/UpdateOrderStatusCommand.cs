using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Orders.Commands;

public record UpdateOrderStatusCommand(Guid OrderId, OrderStatus NewStatus) : IRequest<Result>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result>
{
    private readonly IOrderRepository _orderRepository;
    private readonly INotificationRepository _notificationRepository;

    public UpdateOrderStatusCommandHandler(
        IOrderRepository orderRepository,
        INotificationRepository notificationRepository)
    {
        _orderRepository = orderRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null)
            return Result.Failure("Order not found.");

        if (!IsValidTransition(order.Status, request.NewStatus))
            return Result.Failure($"Cannot transition from {order.Status} to {request.NewStatus}.");

        var previousStatus = order.Status;
        order.Status = request.NewStatus;
        await _orderRepository.UpdateAsync(order, cancellationToken);

        // Notify the customer about the status change
        var message = GetStatusChangeMessage(order.OrderNumber, request.NewStatus);
        var notification = new Notification
        {
            UserId = order.UserId,
            Message = message,
            OrderId = order.Id.ToString(),
            IsRead = false
        };
        await _notificationRepository.CreateAsync(notification, cancellationToken);

        return Result.Success();
    }

    private static string GetStatusChangeMessage(string orderNumber, OrderStatus newStatus)
    {
        return newStatus switch
        {
            OrderStatus.Confirmed => $"Order #{orderNumber} has been confirmed",
            OrderStatus.Processing => $"Order #{orderNumber} is being processed",
            OrderStatus.Shipped => $"Order #{orderNumber} has been shipped",
            OrderStatus.Delivered => $"Order #{orderNumber} has been delivered",
            OrderStatus.Cancelled => $"Order #{orderNumber} has been cancelled",
            _ => $"Order #{orderNumber} status updated to {newStatus}"
        };
    }

    private static bool IsValidTransition(OrderStatus current, OrderStatus next)
    {
        if (next == OrderStatus.Cancelled)
            return true;

        return (current, next) switch
        {
            (OrderStatus.Pending, OrderStatus.Confirmed) => true,
            (OrderStatus.Confirmed, OrderStatus.Processing) => true,
            (OrderStatus.Processing, OrderStatus.Shipped) => true,
            (OrderStatus.Shipped, OrderStatus.Delivered) => true,
            _ => false
        };
    }
}
