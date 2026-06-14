using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Orders.DTOs;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Orders.Queries;

public record GetAdminOrdersQuery(
    int Page = 1,
    int PageSize = 20,
    OrderStatus? Status = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null,
    string? Search = null) : IRequest<Result<PagedResult<OrderListDto>>>;

public class GetAdminOrdersQueryHandler : IRequestHandler<GetAdminOrdersQuery, Result<PagedResult<OrderListDto>>>
{
    private readonly IOrderRepository _orderRepository;

    public GetAdminOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Result<PagedResult<OrderListDto>>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (items, totalCount) = await _orderRepository.GetAllAsync(
            page, pageSize,
            request.Status, request.DateFrom, request.DateTo,
            request.Search, cancellationToken);

        var itemCounts = await _orderRepository.GetItemCountsAsync(
            items.Select(o => o.Id).ToList(), cancellationToken);

        var dtos = items.Select(o => new OrderListDto(
            o.Id, o.OrderNumber, o.Status,
            o.ShippingAddress.FullName, o.ShippingAddress.PhoneNumber, o.ShippingAddress.City,
            o.ShippingAddress.Street, o.ShippingAddress.PostalCode,
            o.Total, o.CurrencyCode,
            itemCounts.GetValueOrDefault(o.Id), o.CreatedAt)).ToList();

        return Result<PagedResult<OrderListDto>>.Success(
            new PagedResult<OrderListDto>(dtos, totalCount, page, pageSize));
    }
}
