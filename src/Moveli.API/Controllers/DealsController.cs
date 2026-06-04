using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Deals.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DealsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DealsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetDeals([FromQuery] string? placement = null, [FromQuery] bool home = false)
    {
        var result = await _mediator.Send(new GetDealsQuery(placement, home));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetDealProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] decimal? minPercentage = null)
    {
        var result = await _mediator.Send(new GetDealProductsQuery(page, pageSize, categoryId, minPercentage));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }
}
