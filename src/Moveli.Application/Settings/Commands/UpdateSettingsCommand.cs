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
    string? AnnouncementKa) : IRequest<Result<SettingsDto>>;

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
    }
}

public class UpdateSettingsCommandHandler : IRequestHandler<UpdateSettingsCommand, Result<SettingsDto>>
{
    private readonly ISettingsRepository _settingsRepository;

    public UpdateSettingsCommandHandler(ISettingsRepository settingsRepository)
    {
        _settingsRepository = settingsRepository;
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

        await _settingsRepository.UpdateAsync(s, cancellationToken);

        return Result<SettingsDto>.Success(new SettingsDto(
            s.StoreName, s.SupportEmail, s.SupportPhone, s.CurrencyCode,
            s.FreeShippingThreshold, s.ShippingCost, s.FreeShippingCity,
            s.MaintenanceMode, s.AnnouncementEn, s.AnnouncementKa));
    }
}
