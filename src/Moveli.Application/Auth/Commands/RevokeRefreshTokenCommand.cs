using MediatR;
using Moveli.Application.Common;

namespace Moveli.Application.Auth.Commands;

public record RevokeRefreshTokenCommand(string RefreshToken) : IRequest<Result>;
