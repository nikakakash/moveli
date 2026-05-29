using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Common;
using Moveli.Application.Orders.Commands;
using Moveli.Application.Orders.DTOs;
using Moveli.Application.Orders.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public OrdersController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        var command = new CreateOrderCommand(
            _currentUser.UserId!.Value,
            request.ShippingFullName,
            request.ShippingPhoneNumber,
            request.ShippingCity,
            request.ShippingStreet,
            request.ShippingPostalCode,
            request.PaymentMethod,
            request.Notes,
            request.PromoCode);

        var result = await _mediator.Send(command);
        return result.IsSuccess ? CreatedAtAction(nameof(GetDetail), new { id = result.Value!.Id }, result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var result = await _mediator.Send(new GetUserOrdersQuery(_currentUser.UserId!.Value, page, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var result = await _mediator.Send(new GetOrderDetailQuery(id, _currentUser.UserId));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }
}
