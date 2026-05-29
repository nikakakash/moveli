using Moveli.Domain.Enums;

namespace Moveli.Application.Dashboard.DTOs;

public record DashboardStatsDto(
    int TotalOrders,
    decimal TotalRevenue,
    int TotalProducts,
    int TotalCustomers,
    List<RecentOrderDto> RecentOrders,
    List<TopProductDto> TopProducts,
    List<LowStockProductDto> LowStockProducts);

public record RecentOrderDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal Total,
    DateTime CreatedAt);

public record TopProductDto(
    Guid Id,
    string NameEn,
    string NameKa,
    int OrderCount);

public record LowStockProductDto(
    Guid Id,
    string NameEn,
    string NameKa,
    string Slug,
    int StockQuantity);
