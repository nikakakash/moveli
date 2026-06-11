using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Cart.Commands;
using Moveli.Application.Cart.DTOs;
using Moveli.Application.Cart.Queries;
using Moveli.Application.Common;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public CartController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var (userId, sessionId) = GetCartIdentifier();
        var result = await _mediator.Send(new GetCartQuery(userId, sessionId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request)
    {
        var (userId, sessionId) = GetCartIdentifier();
        var result = await _mediator.Send(new AddCartItemCommand(userId, sessionId, request.ProductId, request.Quantity));
        if (!result.IsSuccess) return BadRequest(new { error = result.Error });

        return await ReturnUpdatedCart(userId, sessionId);
    }

    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] UpdateCartItemRequest request)
    {
        var (userId, sessionId) = GetCartIdentifier();
        var result = await _mediator.Send(new UpdateCartItemCommand(userId, sessionId, itemId, request.Quantity));
        if (!result.IsSuccess) return BadRequest(new { error = result.Error });

        return await ReturnUpdatedCart(userId, sessionId);
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        var (userId, sessionId) = GetCartIdentifier();
        var result = await _mediator.Send(new RemoveCartItemCommand(userId, sessionId, itemId));
        if (!result.IsSuccess) return BadRequest(new { error = result.Error });

        return await ReturnUpdatedCart(userId, sessionId);
    }

    private async Task<IActionResult> ReturnUpdatedCart(Guid? userId, string? sessionId)
    {
        var cartResult = await _mediator.Send(new GetCartQuery(userId, sessionId));
        return cartResult.IsSuccess ? Ok(cartResult.Value) : Ok();
    }

    private (Guid? UserId, string? SessionId) GetCartIdentifier()
    {
        if (_currentUser.IsAuthenticated && _currentUser.UserId.HasValue)
            return (_currentUser.UserId, null);

        var sessionId = HttpContext.Request.Cookies["cart_session"];
        if (string.IsNullOrEmpty(sessionId))
        {
            sessionId = Guid.NewGuid().ToString();
            HttpContext.Response.Cookies.Append("cart_session", sessionId, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                MaxAge = TimeSpan.FromDays(30)
            });
        }
        return (null, sessionId);
    }
}
