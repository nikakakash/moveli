using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Categories.Commands;
using Moveli.Application.Categories.DTOs;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminCategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        var command = new CreateCategoryCommand(
            request.NameKa, request.NameEn, request.Slug,
            request.DescriptionKa, request.DescriptionEn,
            request.ParentCategoryId, request.ImageUrl,
            request.SortOrder, request.IsActive);

        var result = await _mediator.Send(command);
        return result.IsSuccess
            ? CreatedAtAction("GetBySlug", "Categories", new { slug = result.Value!.Slug }, result.Value)
            : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var command = new UpdateCategoryCommand(
            id, request.NameKa, request.NameEn, request.Slug,
            request.DescriptionKa, request.DescriptionEn,
            request.ParentCategoryId, request.ImageUrl,
            request.SortOrder, request.IsActive);

        var result = await _mediator.Send(command);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteCategoryCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder([FromBody] List<Guid> categoryIds)
    {
        var result = await _mediator.Send(new ReorderCategoriesCommand(categoryIds));
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }
}
