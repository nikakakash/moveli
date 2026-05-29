namespace Moveli.Domain.Interfaces;

public record SalesSummary(
    decimal TotalRevenue,
    int TotalOrders,
    decimal AverageOrderValue,
    int TotalItemsSold);

public record RevenuePoint(DateTime Date, decimal Revenue, int Orders);

public record CategorySales(Guid CategoryId, string CategoryName, decimal Revenue, int UnitsSold);

public record TopProduct(Guid ProductId, string ProductName, decimal Revenue, int UnitsSold);

public record StatusCount(int Status, int Count);

public record SalesReport(
    SalesSummary Summary,
    IReadOnlyList<RevenuePoint> RevenueOverTime,
    IReadOnlyList<CategorySales> SalesByCategory,
    IReadOnlyList<TopProduct> TopProducts,
    IReadOnlyList<StatusCount> OrdersByStatus);

public interface IReportRepository
{
    Task<SalesReport> GetSalesReportAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
}
