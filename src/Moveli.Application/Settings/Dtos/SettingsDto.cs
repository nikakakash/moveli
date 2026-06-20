namespace Moveli.Application.Settings.Dtos;

public record SettingsDto(
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
    string? DealsHeroImageSecondaryUrl);

public record PublicSettingsDto(
    string StoreName,
    bool MaintenanceMode,
    string? AnnouncementEn,
    string? AnnouncementKa,
    string? HeroImagePrimaryUrl,
    string? HeroImageSecondaryUrl,
    string? DealsHeroImagePrimaryUrl,
    string? DealsHeroImageSecondaryUrl,
    decimal FreeShippingThreshold,
    decimal ShippingCost,
    decimal RegionalShippingCost,
    string FreeShippingCity,
    decimal MinOrderTotal);

public record UpdateSettingsRequest(
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
    string? DealsHeroImageSecondaryUrl);
