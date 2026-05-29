using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Settings.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Settings.Queries;

public record GetPublicSettingsQuery : IRequest<Result<PublicSettingsDto>>;

public class GetPublicSettingsQueryHandler : IRequestHandler<GetPublicSettingsQuery, Result<PublicSettingsDto>>
{
    private readonly ISettingsRepository _settingsRepository;

    public GetPublicSettingsQueryHandler(ISettingsRepository settingsRepository)
    {
        _settingsRepository = settingsRepository;
    }

    public async Task<Result<PublicSettingsDto>> Handle(GetPublicSettingsQuery request, CancellationToken cancellationToken)
    {
        var s = await _settingsRepository.GetAsync(cancellationToken);

        return Result<PublicSettingsDto>.Success(new PublicSettingsDto(
            s.StoreName, s.MaintenanceMode, s.AnnouncementEn, s.AnnouncementKa));
    }
}
