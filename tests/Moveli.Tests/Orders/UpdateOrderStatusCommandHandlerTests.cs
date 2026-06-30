using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Moveli.Application.Common;
using Moveli.Application.Orders.Commands;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;
using Xunit;

namespace Moveli.Tests.Orders;

public class UpdateOrderStatusCommandHandlerTests
{
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<INotificationRepository> _notificationRepository = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IUserLookup> _userLookup = new();
    private readonly Mock<IEmailService> _emailService = new();
    private readonly UpdateOrderStatusCommandHandler _sut;

    private static readonly Guid OrderId = Guid.NewGuid();
    private static readonly Guid UserId = Guid.NewGuid();
    private const string OrderNumber = "MV-260010";

    public UpdateOrderStatusCommandHandlerTests()
    {
        _userLookup.Setup(u => u.GetEmailAsync(UserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync("customer@test.com");

        _sut = new UpdateOrderStatusCommandHandler(
            _orderRepository.Object, _notificationRepository.Object, _productRepository.Object,
            _userLookup.Object, _emailService.Object,
            NullLogger<UpdateOrderStatusCommandHandler>.Instance);
    }

    private Order SeedOrder(OrderStatus status)
    {
        var order = new Order
        {
            Id = OrderId,
            UserId = UserId,
            OrderNumber = OrderNumber,
            Status = status,
            ShippingAddress = new ShippingAddress { City = "Batumi" }
        };
        _orderRepository.Setup(r => r.GetByIdAsync(OrderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
        return order;
    }

    [Fact]
    public async Task Handle_TransitionToShipped_SendsEmailWithShippedSubject()
    {
        SeedOrder(OrderStatus.Processing);
        string? capturedSubject = null;
        _emailService
            .Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, string, string, CancellationToken>((_, subj, _, _) => capturedSubject = subj)
            .Returns(Task.CompletedTask);

        await _sut.Handle(new UpdateOrderStatusCommand(OrderId, OrderStatus.Shipped), CancellationToken.None);

        capturedSubject.Should().Be($"Order {OrderNumber} shipped");
    }

    [Fact]
    public async Task Handle_TransitionToConfirmed_SendsEmailWithConfirmedSubject()
    {
        SeedOrder(OrderStatus.Pending);
        string? capturedSubject = null;
        _emailService
            .Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, string, string, CancellationToken>((_, subj, _, _) => capturedSubject = subj)
            .Returns(Task.CompletedTask);

        await _sut.Handle(new UpdateOrderStatusCommand(OrderId, OrderStatus.Confirmed), CancellationToken.None);

        capturedSubject.Should().Be($"Order {OrderNumber} confirmed");
    }

    [Fact]
    public async Task Handle_TransitionToCancelled_SendsEmailWithCancelledSubject()
    {
        SeedOrder(OrderStatus.Confirmed);
        string? capturedSubject = null;
        _emailService
            .Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, string, string, CancellationToken>((_, subj, _, _) => capturedSubject = subj)
            .Returns(Task.CompletedTask);

        await _sut.Handle(new UpdateOrderStatusCommand(OrderId, OrderStatus.Cancelled), CancellationToken.None);

        capturedSubject.Should().Be($"Order {OrderNumber} cancelled");
    }
}
