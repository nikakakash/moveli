using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Products.Commands;
using Moveli.Application.Products.DTOs;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var command = new CreateProductCommand(
            request.NameKa, request.NameEn, request.Slug,
            request.DescriptionKa, request.DescriptionEn,
            request.SKU, request.Price, request.CompareAtPrice,
            request.CategoryId, request.BrandId,
            request.StockQuantity, request.IsActive, request.IsFeatured,
            request.ImageUrls);

        var result = await _mediator.Send(command);
        return result.IsSuccess
            ? CreatedAtAction("GetProductBySlug", "Products", new { slug = result.Value!.Slug }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var command = new UpdateProductCommand(
            id, request.NameKa, request.NameEn, request.Slug,
            request.DescriptionKa, request.DescriptionEn,
            request.SKU, request.Price, request.CompareAtPrice,
            request.CategoryId, request.BrandId,
            request.StockQuantity, request.IsActive, request.IsFeatured,
            request.ImageUrls);

        var result = await _mediator.Send(command);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteProductCommand(id));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }

    [HttpPatch("{id:guid}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        var result = await _mediator.Send(new ToggleProductActiveCommand(id));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }
}
