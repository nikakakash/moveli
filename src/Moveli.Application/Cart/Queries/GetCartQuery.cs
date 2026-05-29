using MediatR;
using Moveli.Application.Cart.DTOs;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Cart.Queries;

public record GetCartQuery(Guid? UserId, string? SessionId) : IRequest<Result<CartDto>>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, Result<CartDto>>
{
    private readonly ICartRepository _cartRepository;

    public GetCartQueryHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        Domain.Entities.Cart? cart = null;

        if (request.UserId.HasValue)
            cart = await _cartRepository.GetByUserIdAsync(request.UserId.Value, cancellationToken);
        else if (!string.IsNullOrEmpty(request.SessionId))
            cart = await _cartRepository.GetBySessionIdAsync(request.SessionId, cancellationToken);

        if (cart == null)
            return Result<CartDto>.Success(new CartDto(Guid.Empty, [], 0));

        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ProductId,
            i.Product.Name.Ka,
            i.Product.Name.En,
            i.Product.Slug,
            i.Product.Images.FirstOrDefault(img => img.IsMain)?.Url ?? i.Product.Images.FirstOrDefault()?.Url,
            i.Quantity,
            i.UnitPrice,
            i.UnitPrice * i.Quantity)).ToList();

        return Result<CartDto>.Success(new CartDto(cart.Id, items, items.Sum(i => i.Total)));
    }
}
