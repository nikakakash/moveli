using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Brands.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BrandsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetBrandsQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new GetBrandBySlugQuery(slug));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }
}
