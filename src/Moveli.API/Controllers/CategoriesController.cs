using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Categories.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetTree()
    {
        var result = await _mediator.Send(new GetCategoryTreeQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new GetCategoryBySlugQuery(slug));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpGet("{id:guid}/products")]
    public async Task<IActionResult> GetProducts(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var result = await _mediator.Send(new GetCategoryProductsQuery(id, page, pageSize, sortBy));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }
}
