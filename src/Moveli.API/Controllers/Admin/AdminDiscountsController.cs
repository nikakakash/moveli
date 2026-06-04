using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Discounts.Commands;
using Moveli.Application.Discounts.DTOs;
using Moveli.Application.Discounts.Queries;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/discounts")]
[Authorize(Roles = "Admin")]
public class AdminDiscountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminDiscountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetDiscountsQuery(page, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDiscountRequest request)
    {
        var command = new CreateDiscountCommand(
            request.Scope, request.TargetId, request.Percentage,
            request.IsActive, request.StartsAt, request.EndsAt,
            request.TitleKa, request.TitleEn, request.ImageUrl,
            request.Placement, request.ShowOnHome, request.ShowCountdown);
        var result = await _mediator.Send(command);
        return result.IsSuccess
            ? Ok(new { id = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkCreateProductDiscounts(
        [FromBody] BulkCreateProductDiscountsRequest request)
    {
        var command = new BulkCreateProductDiscountsCommand(
            request.ProductIds, request.Percentage, request.IsActive,
            request.StartsAt, request.EndsAt,
            request.TitleKa, request.TitleEn, request.ImageUrl,
            request.Placement, request.ShowOnHome, request.ShowCountdown);
        var result = await _mediator.Send(command);
        return result.IsSuccess
            ? Ok(new { created = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDiscountRequest request)
    {
        var command = new UpdateDiscountCommand(
            id, request.Scope, request.TargetId, request.Percentage,
            request.IsActive, request.StartsAt, request.EndsAt,
            request.TitleKa, request.TitleEn, request.ImageUrl,
            request.Placement, request.ShowOnHome, request.ShowCountdown);
        var result = await _mediator.Send(command);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteDiscountCommand(id));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }
}
