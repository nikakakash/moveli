using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Admin.DTOs;
using Moveli.Application.Admin.Queries;
using Moveli.Application.Common;
using Moveli.Domain.Enums;

namespace Moveli.API.Infrastructure.Admin;

public class GetAdminCustomerDetailQueryHandler : IRequestHandler<GetAdminCustomerDetailQuery, Result<AdminCustomerDetailDto>>
{
    private readonly MoveliDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetAdminCustomerDetailQueryHandler(MoveliDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<Result<AdminCustomerDetailDto>> Handle(GetAdminCustomerDetailQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id.ToString());
        if (user == null)
            return Result<AdminCustomerDetailDto>.Failure("Customer not found.");

        var orders = await _context.Orders
            .Where(o => o.UserId == request.Id)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        var nonCancelledOrders = orders.Where(o => o.Status != OrderStatus.Cancelled).ToList();
        var orderCount = nonCancelledOrders.Count;
        var totalSpent = nonCancelledOrders.Sum(o => o.Total);

        var recentOrders = orders
            .Take(10)
            .Select(o => new CustomerOrderDto(
                o.Id, o.OrderNumber, o.Status, o.Total, o.CreatedAt))
            .ToList();

        return Result<AdminCustomerDetailDto>.Success(new AdminCustomerDetailDto(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.PhoneNumber ?? "",
            user.PreferredLanguage,
            user.CreatedAt,
            orderCount,
            totalSpent,
            recentOrders));
    }
}
