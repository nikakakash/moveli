using MediatR;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Application.Admin.DTOs;
using Moveli.Application.Admin.Queries;
using Moveli.Application.Common;
using Moveli.Domain.Enums;

namespace Moveli.API.Infrastructure.Admin;

public class GetAdminCustomersQueryHandler : IRequestHandler<GetAdminCustomersQuery, Result<PagedResult<AdminCustomerDto>>>
{
    private readonly MoveliDbContext _context;

    public GetAdminCustomersQueryHandler(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<AdminCustomerDto>>> Handle(GetAdminCustomersQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        // Filter + page in SQL via the Customer role join instead of materializing every user.
        var customerRoleId = await _context.Roles
            .Where(r => r.Name == "Customer")
            .Select(r => r.Id)
            .FirstOrDefaultAsync(cancellationToken);

        var customers = _context.Users
            .AsNoTracking()
            .Where(u => _context.UserRoles.Any(ur => ur.UserId == u.Id && ur.RoleId == customerRoleId));

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            customers = customers.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(search)) ||
                u.FirstName.ToLower().Contains(search) ||
                u.LastName.ToLower().Contains(search));
        }

        var totalCount = await customers.CountAsync(cancellationToken);

        var pageUsers = await customers
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id, u.Email, u.FirstName, u.LastName,
                u.PhoneNumber, u.PreferredLanguage, u.CreatedAt
            })
            .ToListAsync(cancellationToken);

        // Order stats only for the customers on this page.
        var pageIds = pageUsers.Select(u => u.Id).ToList();
        var orderStats = await _context.Orders
            .Where(o => pageIds.Contains(o.UserId) && o.Status != OrderStatus.Cancelled)
            .GroupBy(o => o.UserId)
            .Select(g => new { UserId = g.Key, OrderCount = g.Count(), TotalSpent = g.Sum(o => o.Total) })
            .ToDictionaryAsync(x => x.UserId, cancellationToken);

        var dtos = pageUsers.Select(u =>
        {
            orderStats.TryGetValue(u.Id, out var stats);
            return new AdminCustomerDto(
                u.Id, u.Email!, u.FirstName, u.LastName, u.PhoneNumber ?? "",
                u.PreferredLanguage, u.CreatedAt,
                stats?.OrderCount ?? 0, stats?.TotalSpent ?? 0);
        }).ToList();

        return Result<PagedResult<AdminCustomerDto>>.Success(
            new PagedResult<AdminCustomerDto>(dtos, totalCount, page, pageSize));
    }
}
