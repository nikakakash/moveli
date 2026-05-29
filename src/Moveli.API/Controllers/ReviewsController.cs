using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Common;
using Moveli.Application.Reviews.Commands;
using Moveli.Application.Reviews.DTOs;
using Moveli.Application.Reviews.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/products/{productId:guid}/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public ReviewsController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews(Guid productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var result = await _mediator.Send(new GetProductReviewsQuery(productId, page, pageSize));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview(Guid productId, [FromBody] CreateReviewRequest request)
    {
        var command = new CreateReviewCommand(productId, _currentUser.UserId!.Value, request.Rating, request.Comment);
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Created(string.Empty, result.Value) : BadRequest(new { error = result.Error });
    }
}
