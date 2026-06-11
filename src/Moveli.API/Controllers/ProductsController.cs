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
        [FromQuery] decimal? minRating = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null)
    {
        // Paging bounds are enforced once, in the handler (the trust boundary for all callers).
        var result = await _mediator.Send(new GetProductsQuery(
            page, pageSize, categoryId, brandId, minPrice, maxPrice, minRating, search, sortBy));

        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpGet("price-histogram")]
    public async Task<IActionResult> GetPriceHistogram(
        [FromQuery] int buckets = 16,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? brandId = null,
        [FromQuery] decimal? minRating = null,
        [FromQuery] string? search = null)
    {
        var result = await _mediator.Send(new GetPriceHistogramQuery(
            buckets, categoryId, brandId, minRating, search));

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
        var result = await _mediator.Send(new GetFeaturedProductsQuery(count));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }
}
