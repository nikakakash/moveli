using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Notifications.Queries;

public record GetNotificationsQuery(Guid UserId, int Limit = 20) : IRequest<Result<NotificationsResponse>>;

public record NotificationDto(Guid Id, string Message, string? OrderId, bool IsRead, DateTime CreatedAt);

public record NotificationsResponse(List<NotificationDto> Items, int UnreadCount);

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, Result<NotificationsResponse>>
{
    private readonly INotificationRepository _notificationRepository;

    public GetNotificationsQueryHandler(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<Result<NotificationsResponse>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(request.UserId, request.Limit, cancellationToken);
        var unreadCount = await _notificationRepository.GetUnreadCountAsync(request.UserId, cancellationToken);

        var items = notifications.Select(n => new NotificationDto(
            n.Id, n.Message, n.OrderId, n.IsRead, n.CreatedAt)).ToList();

        return Result<NotificationsResponse>.Success(new NotificationsResponse(items, unreadCount));
    }
}
