using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Dashboard.DTOs;

namespace Moveli.Application.Dashboard.Queries;

public record GetDashboardStatsQuery : IRequest<Result<DashboardStatsDto>>;
