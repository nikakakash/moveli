using MediatR;
using Microsoft.Extensions.Logging;
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
    private readonly IProductRepository _productRepository;
    private readonly IUserLookup _userLookup;
    private readonly IEmailService _emailService;
    private readonly ILogger<UpdateOrderStatusCommandHandler> _logger;

    public UpdateOrderStatusCommandHandler(
        IOrderRepository orderRepository,
        INotificationRepository notificationRepository,
        IProductRepository productRepository,
        IUserLookup userLookup,
        IEmailService emailService,
        ILogger<UpdateOrderStatusCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _notificationRepository = notificationRepository;
        _productRepository = productRepository;
        _userLookup = userLookup;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null)
            return Result.Failure("Order not found.");

        if (!IsValidTransition(order.Status, request.NewStatus))
            return Result.Failure($"Cannot transition from {order.Status} to {request.NewStatus}.");

        var previousStatus = order.Status;

        // Cancelling an order that wasn't already cancelled: return its items to stock and, if it
        // had been paid, mark the payment refunded (COD orders were never charged, so leave as-is).
        if (request.NewStatus == OrderStatus.Cancelled && previousStatus != OrderStatus.Cancelled)
        {
            await _productRepository.RestockAsync(
                order.Items.Select(i => (i.ProductId, i.Quantity)), cancellationToken);
            if (order.PaymentStatus == PaymentStatus.Paid)
                order.PaymentStatus = PaymentStatus.Refunded;
        }

        order.Status = request.NewStatus;
        await _orderRepository.UpdateAsync(order, cancellationToken);

        // Notify the customer about the status change (in-app + best-effort email).
        var message = GetStatusChangeMessage(order.OrderNumber, request.NewStatus);
        await _notificationRepository.CreateAsync(new Notification
        {
            UserId = order.UserId,
            Message = message,
            OrderId = order.Id.ToString(),
            IsRead = false
        }, cancellationToken);

        await TrySendStatusEmailAsync(order.UserId, message, cancellationToken);

        return Result.Success();
    }

    private async Task TrySendStatusEmailAsync(Guid userId, string message, CancellationToken cancellationToken)
    {
        try
        {
            var email = await _userLookup.GetEmailAsync(userId, cancellationToken);
            if (!string.IsNullOrEmpty(email))
                await _emailService.SendAsync(email, "Moveli order update", $"<p>{message}</p>", cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order status email to user {UserId}", userId);
        }
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
