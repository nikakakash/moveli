using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Notifications.Commands;

public record MarkNotificationReadCommand(Guid NotificationId) : IRequest<Result>;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, Result>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ICurrentUser _currentUser;

    public MarkNotificationReadCommandHandler(INotificationRepository notificationRepository, ICurrentUser currentUser)
    {
        _notificationRepository = notificationRepository;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || !_currentUser.UserId.HasValue)
            return Result.Failure("Not authenticated.");

        await _notificationRepository.MarkAsReadAsync(request.NotificationId, _currentUser.UserId.Value, cancellationToken);
        return Result.Success();
    }
}

public record MarkAllNotificationsReadCommand : IRequest<Result>;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, Result>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ICurrentUser _currentUser;

    public MarkAllNotificationsReadCommandHandler(INotificationRepository notificationRepository, ICurrentUser currentUser)
    {
        _notificationRepository = notificationRepository;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || !_currentUser.UserId.HasValue)
            return Result.Failure("Not authenticated.");

        await _notificationRepository.MarkAllAsReadAsync(_currentUser.UserId.Value, cancellationToken);
        return Result.Success();
    }
}
