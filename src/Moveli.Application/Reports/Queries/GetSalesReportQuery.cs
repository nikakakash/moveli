using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Reports.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Reports.Queries;

public record GetSalesReportQuery(DateTime? From = null, DateTime? To = null) : IRequest<Result<SalesReportDto>>;

public class GetSalesReportQueryHandler : IRequestHandler<GetSalesReportQuery, Result<SalesReportDto>>
{
    private readonly IReportRepository _reportRepository;

    public GetSalesReportQueryHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<Result<SalesReportDto>> Handle(GetSalesReportQuery request, CancellationToken cancellationToken)
    {
        // .Date (and DateTimes parsed from the query string) yield Kind=Unspecified,
        // which Npgsql rejects when binding to a 'timestamp with time zone' column —
        // force UTC so the parameters are valid.
        var to = DateTime.SpecifyKind(
            (request.To ?? DateTime.UtcNow).Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
        var from = DateTime.SpecifyKind(
            (request.From ?? DateTime.UtcNow.AddDays(-29)).Date, DateTimeKind.Utc);

        var report = await _reportRepository.GetSalesReportAsync(from, to, cancellationToken);

        var dto = new SalesReportDto(
            new SalesSummaryDto(
                report.Summary.TotalRevenue,
                report.Summary.TotalOrders,
                report.Summary.AverageOrderValue,
                report.Summary.TotalItemsSold),
            report.RevenueOverTime.Select(r => new RevenuePointDto(r.Date, r.Revenue, r.Orders)).ToList(),
            report.SalesByCategory.Select(c => new CategorySalesDto(c.CategoryId, c.CategoryName, c.Revenue, c.UnitsSold)).ToList(),
            report.TopProducts.Select(p => new TopProductDto(p.ProductId, p.ProductName, p.Revenue, p.UnitsSold)).ToList(),
            report.OrdersByStatus.Select(s => new StatusCountDto(s.Status, s.Count)).ToList());

        return Result<SalesReportDto>.Success(dto);
    }
}
