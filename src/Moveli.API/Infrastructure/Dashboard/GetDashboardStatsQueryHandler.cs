using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Common;
using Moveli.Application.Dashboard.DTOs;
using Moveli.Application.Dashboard.Queries;
using Moveli.Domain.Enums;

namespace Moveli.API.Infrastructure.Dashboard;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, Result<DashboardStatsDto>>
{
    private readonly MoveliDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetDashboardStatsQueryHandler(MoveliDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<Result<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var totalOrders = await _context.Orders.CountAsync(cancellationToken);
        var totalRevenue = await _context.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .Select(o => (decimal?)o.Total)
            .SumAsync(cancellationToken) ?? 0m;
        var totalProducts = await _context.Products.CountAsync(cancellationToken);
        var customers = await _userManager.GetUsersInRoleAsync("Customer");
        var totalCustomers = customers.Count;

        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new RecentOrderDto(o.Id, o.OrderNumber, o.Status, o.Total, o.CreatedAt))
            .ToListAsync(cancellationToken);

        // Top products by number of order items — aggregated in the database (single round-trip).
        // EF Core 9 can't translate a record constructor inside GroupBy/Select, so we project to
        // an anonymous type for the SQL, then materialize records in memory.
        var topProductRows = await _context.Set<Domain.Entities.OrderItem>()
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g => new { g.Key.ProductId, g.Key.ProductName, OrderCount = g.Count() })
            .OrderByDescending(x => x.OrderCount)
            .Take(10)
            .ToListAsync(cancellationToken);
        var topProducts = topProductRows
            .Select(r => new TopProductDto(r.ProductId, r.ProductName, r.ProductName, r.OrderCount))
            .ToList();

        var lowStockProducts = await _context.Products
            .Where(p => p.StockQuantity < 10 && p.IsActive)
            .OrderBy(p => p.StockQuantity)
            .Take(10)
            .Select(p => new LowStockProductDto(p.Id, p.Name.En, p.Name.Ka, p.Slug, p.StockQuantity))
            .ToListAsync(cancellationToken);

        return Result<DashboardStatsDto>.Success(new DashboardStatsDto(
            totalOrders, totalRevenue, totalProducts, totalCustomers,
            recentOrders, topProducts, lowStockProducts));
    }
}
