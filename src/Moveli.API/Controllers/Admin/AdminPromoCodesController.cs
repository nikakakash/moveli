using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.PromoCodes.Commands;
using Moveli.Application.PromoCodes.Dtos;
using Moveli.Application.PromoCodes.Queries;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/promo-codes")]
[Authorize(Roles = "Admin")]
public class AdminPromoCodesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminPromoCodesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetPromoCodesQuery(page, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePromoCodeRequest request)
    {
        var command = new CreatePromoCodeCommand(
            request.Code, request.Type, request.Value,
            request.IsActive, request.StartsAt, request.EndsAt);
        var result = await _mediator.Send(command);
        return result.IsSuccess
            ? Ok(new { id = result.Value })
            : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePromoCodeRequest request)
    {
        var command = new UpdatePromoCodeCommand(
            id, request.Code, request.Type, request.Value,
            request.IsActive, request.StartsAt, request.EndsAt);
        var result = await _mediator.Send(command);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeletePromoCodeCommand(id));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }
}
