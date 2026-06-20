using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Moveli.Application.Common;
using Moveli.Application.PromoCodes.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/promo-codes")]
[Authorize]
[EnableRateLimiting("promo")]
public class PromoCodesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public PromoCodesController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    public record ValidatePromoRequest(string Code, decimal Subtotal);

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidatePromoRequest request)
    {
        var result = await _mediator.Send(
            new ValidatePromoCodeQuery(request.Code, request.Subtotal, _currentUser.UserId!.Value));

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}
