using MediatR;
using Moveli.Application.Admin.DTOs;
using Moveli.Application.Common;

namespace Moveli.Application.Admin.Queries;

public record GetAdminCustomersQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null) : IRequest<Result<PagedResult<AdminCustomerDto>>>;
