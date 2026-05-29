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

public class GetAdminCustomersQueryHandler : IRequestHandler<GetAdminCustomersQuery, Result<PagedResult<AdminCustomerDto>>>
{
    private readonly MoveliDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetAdminCustomersQueryHandler(MoveliDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<Result<PagedResult<AdminCustomerDto>>> Handle(GetAdminCustomersQuery request, CancellationToken cancellationToken)
    {
        var customers = await _userManager.GetUsersInRoleAsync("Customer");

        var customerIds = customers.Select(c => c.Id).ToList();

        var orderStats = await _context.Orders
            .Where(o => customerIds.Contains(o.UserId) && o.Status != OrderStatus.Cancelled)
            .GroupBy(o => o.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                OrderCount = g.Count(),
                TotalSpent = g.Sum(o => o.Total)
            })
            .ToDictionaryAsync(x => x.UserId, cancellationToken);

        var query = customers.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(c =>
                c.Email!.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                c.FirstName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                c.LastName.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var filtered = query
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

        var totalCount = filtered.Count;

        var paged = filtered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c =>
            {
                orderStats.TryGetValue(c.Id, out var stats);
                return new AdminCustomerDto(
                    c.Id,
                    c.Email!,
                    c.FirstName,
                    c.LastName,
                    c.PhoneNumber ?? "",
                    c.PreferredLanguage,
                    c.CreatedAt,
                    stats?.OrderCount ?? 0,
                    stats?.TotalSpent ?? 0);
            })
            .ToList();

        return Result<PagedResult<AdminCustomerDto>>.Success(
            new PagedResult<AdminCustomerDto>(paged, totalCount, request.Page, request.PageSize));
    }
}
