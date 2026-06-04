using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Settings.Commands;
using Moveli.Application.Settings.Dtos;
using Moveli.Application.Settings.Queries;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminSettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new GetSettingsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateSettingsRequest request)
    {
        var command = new UpdateSettingsCommand(
            request.StoreName, request.SupportEmail, request.SupportPhone, request.CurrencyCode,
            request.FreeShippingThreshold, request.ShippingCost, request.FreeShippingCity,
            request.MaintenanceMode, request.AnnouncementEn, request.AnnouncementKa,
            request.HeroImagePrimaryUrl, request.HeroImageSecondaryUrl,
            request.DealsHeroImagePrimaryUrl, request.DealsHeroImageSecondaryUrl);
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }
}
