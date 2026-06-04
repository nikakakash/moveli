using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Moveli.Application.Common;
using Moveli.Application.Settings.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Settings.Queries;

public record GetPublicSettingsQuery : IRequest<Result<PublicSettingsDto>>;

public class GetPublicSettingsQueryHandler : IRequestHandler<GetPublicSettingsQuery, Result<PublicSettingsDto>>
{
    private readonly ISettingsRepository _settingsRepository;
    private readonly IMemoryCache _cache;
    private readonly ICacheInvalidator _invalidator;

    private const string CacheKey = "settings:public";
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);

    public GetPublicSettingsQueryHandler(
        ISettingsRepository settingsRepository,
        IMemoryCache cache,
        ICacheInvalidator invalidator)
    {
        _settingsRepository = settingsRepository;
        _cache = cache;
        _invalidator = invalidator;
    }

    public async Task<Result<PublicSettingsDto>> Handle(GetPublicSettingsQuery request, CancellationToken cancellationToken)
    {
        // Hot path — every storefront page reads this for banner / maintenance flag.
        var dto = await _cache.GetOrCreateAsync(CacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = Ttl;
            entry.AddExpirationToken(_invalidator.GetChangeToken(CacheInvalidatorScopes.Settings));
            var s = await _settingsRepository.GetAsync(cancellationToken);
            return new PublicSettingsDto(
                s.StoreName, s.MaintenanceMode, s.AnnouncementEn, s.AnnouncementKa,
                s.HeroImagePrimaryUrl, s.HeroImageSecondaryUrl,
                s.DealsHeroImagePrimaryUrl, s.DealsHeroImageSecondaryUrl);
        });

        return Result<PublicSettingsDto>.Success(dto!);
    }
}
