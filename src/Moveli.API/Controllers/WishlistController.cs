using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Common;
using Moveli.Application.Wishlists.Commands;
using Moveli.Application.Wishlists.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public WishlistController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var result = await _mediator.Send(new GetWishlistQuery(_currentUser.UserId!.Value));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Add(Guid productId)
    {
        var result = await _mediator.Send(new AddToWishlistCommand(_currentUser.UserId!.Value, productId));
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId)
    {
        var result = await _mediator.Send(new RemoveFromWishlistCommand(_currentUser.UserId!.Value, productId));
        return result.IsSuccess ? Ok() : NotFound(new { error = result.Error });
    }
}
