using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly MoveliDbContext _context;

    public ReportRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<SalesReport> GetSalesReportAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        // Revenue counts paid/active orders (everything except Cancelled).
        var paidOrders = _context.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.Status != OrderStatus.Cancelled);

        var totalRevenue = await paidOrders.SumAsync(o => (decimal?)o.Total, cancellationToken) ?? 0m;
        var totalOrders = await paidOrders.CountAsync(cancellationToken);

        var summary = new SalesSummary(
            TotalRevenue: totalRevenue,
            TotalOrders: totalOrders,
            AverageOrderValue: totalOrders > 0 ? Math.Round(totalRevenue / totalOrders, 2) : 0m,
            TotalItemsSold: await _context.OrderItems
                .Where(i => i.Order.CreatedAt >= from && i.Order.CreatedAt <= to && i.Order.Status != OrderStatus.Cancelled)
                .SumAsync(i => (int?)i.Quantity, cancellationToken) ?? 0);

        // Revenue over time (by day)
        var revenueRaw = await paidOrders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.Total), Orders = g.Count() })
            .OrderBy(x => x.Date)
            .ToListAsync(cancellationToken);
        var revenueOverTime = revenueRaw
            .Select(x => new RevenuePoint(x.Date, x.Revenue, x.Orders))
            .ToList();

        // Sales by category — group by the scalar CategoryId only (grouping by an
        // owned-type navigation property like Category.Name.En is not translatable by
        // Npgsql), then resolve category display names in a separate query.
        var categoryRaw = await _context.OrderItems
            .Where(i => i.Order.CreatedAt >= from && i.Order.CreatedAt <= to && i.Order.Status != OrderStatus.Cancelled)
            .Join(_context.Products, i => i.ProductId, p => p.Id, (i, p) => new { i, p.CategoryId })
            .GroupBy(x => x.CategoryId)
            .Select(g => new
            {
                CategoryId = g.Key,
                Revenue = g.Sum(x => x.i.Total),
                UnitsSold = g.Sum(x => x.i.Quantity)
            })
            .OrderByDescending(x => x.Revenue)
            .ToListAsync(cancellationToken);

        var categoryIds = categoryRaw.Select(x => x.CategoryId).ToList();
        var categoryNames = await _context.Categories
            .Where(c => categoryIds.Contains(c.Id))
            .Select(c => new { c.Id, c.Name.En })
            .ToListAsync(cancellationToken);
        var nameLookup = categoryNames.ToDictionary(c => c.Id, c => c.En);

        var salesByCategory = categoryRaw
            .Select(x => new CategorySales(
                x.CategoryId,
                nameLookup.TryGetValue(x.CategoryId, out var name) ? name : "(unknown)",
                x.Revenue,
                x.UnitsSold))
            .ToList();

        // Top products
        var topRaw = await _context.OrderItems
            .Where(i => i.Order.CreatedAt >= from && i.Order.CreatedAt <= to && i.Order.Status != OrderStatus.Cancelled)
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.ProductName,
                Revenue = g.Sum(x => x.Total),
                UnitsSold = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(10)
            .ToListAsync(cancellationToken);
        var topProducts = topRaw
            .Select(x => new TopProduct(x.ProductId, x.ProductName, x.Revenue, x.UnitsSold))
            .ToList();

        // Orders by status (all statuses, in window)
        var statusRaw = await _context.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);
        var ordersByStatus = statusRaw
            .Select(x => new StatusCount((int)x.Status, x.Count))
            .ToList();

        return new SalesReport(summary, revenueOverTime, salesByCategory, topProducts, ordersByStatus);
    }
}
