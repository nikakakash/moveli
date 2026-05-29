namespace Moveli.Application.Reports.Dtos;

public record SalesSummaryDto(
    decimal TotalRevenue,
    int TotalOrders,
    decimal AverageOrderValue,
    int TotalItemsSold);

public record RevenuePointDto(DateTime Date, decimal Revenue, int Orders);

public record CategorySalesDto(Guid CategoryId, string CategoryName, decimal Revenue, int UnitsSold);

public record TopProductDto(Guid ProductId, string ProductName, decimal Revenue, int UnitsSold);

public record StatusCountDto(int Status, int Count);

public record SalesReportDto(
    SalesSummaryDto Summary,
    IReadOnlyList<RevenuePointDto> RevenueOverTime,
    IReadOnlyList<CategorySalesDto> SalesByCategory,
    IReadOnlyList<TopProductDto> TopProducts,
    IReadOnlyList<StatusCountDto> OrdersByStatus);
