using MediatR;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Application.Auth.Commands;
using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Auth;

public class RevokeRefreshTokenCommandHandler : IRequestHandler<RevokeRefreshTokenCommand, Result>
{
    private readonly MoveliDbContext _context;

    public RevokeRefreshTokenCommandHandler(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(RevokeRefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // Idempotent: revoking an unknown or already-revoked token is a no-op success so logout
        // never fails the caller.
        await _context.RefreshTokens
            .Where(t => t.Token == request.RefreshToken && !t.IsRevoked)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsRevoked, true), cancellationToken);

        return Result.Success();
    }
}
