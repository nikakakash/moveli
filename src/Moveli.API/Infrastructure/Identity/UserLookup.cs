using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Identity;

public class UserLookup : IUserLookup
{
    private readonly MoveliDbContext _context;

    public UserLookup(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<string?> GetEmailAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
