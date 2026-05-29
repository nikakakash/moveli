using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Brands.Commands;
using Moveli.Application.Brands.DTOs;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/brands")]
[Authorize(Roles = "Admin")]
public class AdminBrandsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminBrandsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBrandRequest request)
    {
        var command = new CreateBrandCommand(request.Name, request.Slug, request.LogoUrl, request.IsActive);
        var result = await _mediator.Send(command);
        return result.IsSuccess
            ? CreatedAtAction("GetBySlug", "Brands", new { slug = result.Value!.Slug }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBrandRequest request)
    {
        var command = new UpdateBrandCommand(id, request.Name, request.Slug, request.LogoUrl, request.IsActive);
        var result = await _mediator.Send(command);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteBrandCommand(id));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }
}
