using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Settings.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Settings.Queries;

public record GetSettingsQuery : IRequest<Result<SettingsDto>>;

public class GetSettingsQueryHandler : IRequestHandler<GetSettingsQuery, Result<SettingsDto>>
{
    private readonly ISettingsRepository _settingsRepository;

    public GetSettingsQueryHandler(ISettingsRepository settingsRepository)
    {
        _settingsRepository = settingsRepository;
    }

    public async Task<Result<SettingsDto>> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
    {
        var s = await _settingsRepository.GetAsync(cancellationToken);

        return Result<SettingsDto>.Success(new SettingsDto(
            s.StoreName, s.SupportEmail, s.SupportPhone, s.CurrencyCode,
            s.FreeShippingThreshold, s.ShippingCost, s.FreeShippingCity,
            s.MaintenanceMode, s.AnnouncementEn, s.AnnouncementKa));
    }
}
