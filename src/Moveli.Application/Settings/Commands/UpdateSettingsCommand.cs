using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Settings.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Settings.Commands;

public record UpdateSettingsCommand(
    string StoreName,
    string SupportEmail,
    string SupportPhone,
    string CurrencyCode,
    decimal FreeShippingThreshold,
    decimal ShippingCost,
    string FreeShippingCity,
    bool MaintenanceMode,
    string? AnnouncementEn,
    string? AnnouncementKa,
    string? HeroImagePrimaryUrl,
    string? HeroImageSecondaryUrl,
    string? DealsHeroImagePrimaryUrl,
    string? DealsHeroImageSecondaryUrl) : IRequest<Result<SettingsDto>>;

public class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
{
    public UpdateSettingsCommandValidator()
    {
        RuleFor(x => x.StoreName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SupportEmail).MaximumLength(200).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.SupportEmail));
        RuleFor(x => x.SupportPhone).MaximumLength(50);
        RuleFor(x => x.CurrencyCode).NotEmpty().MaximumLength(10);
        RuleFor(x => x.FreeShippingThreshold).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ShippingCost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FreeShippingCity).MaximumLength(100);
        RuleFor(x => x.AnnouncementEn).MaximumLength(500);
        RuleFor(x => x.AnnouncementKa).MaximumLength(500);
        RuleFor(x => x.HeroImagePrimaryUrl).MaximumLength(500);
        RuleFor(x => x.HeroImageSecondaryUrl).MaximumLength(500);
        RuleFor(x => x.DealsHeroImagePrimaryUrl).MaximumLength(500);
        RuleFor(x => x.DealsHeroImageSecondaryUrl).MaximumLength(500);
    }
}

public class UpdateSettingsCommandHandler : IRequestHandler<UpdateSettingsCommand, Result<SettingsDto>>
{
    private readonly ISettingsRepository _settingsRepository;
    private readonly ICacheInvalidator _invalidator;

    public UpdateSettingsCommandHandler(ISettingsRepository settingsRepository, ICacheInvalidator invalidator)
    {
        _settingsRepository = settingsRepository;
        _invalidator = invalidator;
    }

    public async Task<Result<SettingsDto>> Handle(UpdateSettingsCommand request, CancellationToken cancellationToken)
    {
        var s = await _settingsRepository.GetAsync(cancellationToken);

        s.StoreName = request.StoreName;
        s.SupportEmail = request.SupportEmail;
        s.SupportPhone = request.SupportPhone;
        s.CurrencyCode = request.CurrencyCode;
        s.FreeShippingThreshold = request.FreeShippingThreshold;
        s.ShippingCost = request.ShippingCost;
        s.FreeShippingCity = request.FreeShippingCity;
        s.MaintenanceMode = request.MaintenanceMode;
        s.AnnouncementEn = request.AnnouncementEn;
        s.AnnouncementKa = request.AnnouncementKa;
        s.HeroImagePrimaryUrl = request.HeroImagePrimaryUrl;
        s.HeroImageSecondaryUrl = request.HeroImageSecondaryUrl;
        s.DealsHeroImagePrimaryUrl = request.DealsHeroImagePrimaryUrl;
        s.DealsHeroImageSecondaryUrl = request.DealsHeroImageSecondaryUrl;

        try
        {
            await _settingsRepository.UpdateAsync(s, cancellationToken);
        }
        catch (ConcurrencyConflictException ex)
        {
            // The xmin token detected a concurrent admin save; ask the user to reload rather
            // than silently overwrite the other change.
            return Result<SettingsDto>.Failure(ex.Message);
        }

        _invalidator.Invalidate(CacheInvalidatorScopes.Settings);

        return Result<SettingsDto>.Success(new SettingsDto(
            s.StoreName, s.SupportEmail, s.SupportPhone, s.CurrencyCode,
            s.FreeShippingThreshold, s.ShippingCost, s.FreeShippingCity,
            s.MaintenanceMode, s.AnnouncementEn, s.AnnouncementKa,
            s.HeroImagePrimaryUrl, s.HeroImageSecondaryUrl,
            s.DealsHeroImagePrimaryUrl, s.DealsHeroImageSecondaryUrl));
    }
}
