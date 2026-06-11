using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Orders.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Orders.Queries;

public record GetUserOrdersQuery(Guid UserId, int Page = 1, int PageSize = 10) : IRequest<Result<PagedResult<OrderListDto>>>;

public class GetUserOrdersQueryHandler : IRequestHandler<GetUserOrdersQuery, Result<PagedResult<OrderListDto>>>
{
    private readonly IOrderRepository _orderRepository;

    public GetUserOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Result<PagedResult<OrderListDto>>> Handle(GetUserOrdersQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _orderRepository.GetByUserIdAsync(
            request.UserId, request.Page, request.PageSize, cancellationToken);

        var itemCounts = await _orderRepository.GetItemCountsAsync(
            items.Select(o => o.Id).ToList(), cancellationToken);

        var dtos = items.Select(o => new OrderListDto(
            o.Id, o.OrderNumber, o.Status,
            o.ShippingAddress.FullName, o.ShippingAddress.PhoneNumber, o.ShippingAddress.City,
            o.ShippingAddress.Street, o.ShippingAddress.PostalCode,
            o.Total, o.CurrencyCode,
            itemCounts.GetValueOrDefault(o.Id), o.CreatedAt)).ToList();

        return Result<PagedResult<OrderListDto>>.Success(
            new PagedResult<OrderListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}
