using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Products.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? brandId = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var result = await _mediator.Send(new GetProductsQuery(
            page, pageSize, categoryId, brandId, minPrice, maxPrice, search, sortBy));

        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProductBySlug(string slug)
    {
        var result = await _mediator.Send(new GetProductBySlugQuery(slug));
        return result.IsSuccess ? Ok(result.Value) : NotFound(new { error = result.Error });
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts([FromQuery] int count = 10)
    {
        count = Math.Clamp(count, 1, 50);
        var result = await _mediator.Send(new GetFeaturedProductsQuery(count));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }
}
