using MediatR;
using Moveli.Application.Auth.DTOs;
using Moveli.Application.Common;

namespace Moveli.Application.Auth.Queries;

public record GetCurrentUserQuery : IRequest<Result<UserDto>>;
