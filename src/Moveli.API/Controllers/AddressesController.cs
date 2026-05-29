using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Addresses.Commands;
using Moveli.Application.Addresses.DTOs;
using Moveli.Application.Addresses.Queries;
using Moveli.Application.Common;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public AddressesController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var result = await _mediator.Send(new GetMyAddressesQuery(_currentUser.UserId!.Value));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAddressRequest request)
    {
        var command = new CreateAddressCommand(
            _currentUser.UserId!.Value,
            request.FullName, request.PhoneNumber, request.City,
            request.Street, request.PostalCode, request.IsDefault);
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAddressRequest request)
    {
        var command = new UpdateAddressCommand(
            id, _currentUser.UserId!.Value,
            request.FullName, request.PhoneNumber, request.City,
            request.Street, request.PostalCode, request.IsDefault);
        var result = await _mediator.Send(command);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpPatch("{id:guid}/default")]
    public async Task<IActionResult> SetDefault(Guid id)
    {
        var result = await _mediator.Send(new SetDefaultAddressCommand(id, _currentUser.UserId!.Value));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteAddressCommand(id, _currentUser.UserId!.Value));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }
}
