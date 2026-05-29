using MediatR;
using Moveli.Application.Admin.DTOs;
using Moveli.Application.Common;

namespace Moveli.Application.Admin.Queries;

public record GetAdminCustomerDetailQuery(Guid Id) : IRequest<Result<AdminCustomerDetailDto>>;
