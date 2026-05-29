using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class SettingsRepository : ISettingsRepository
{
    private readonly MoveliDbContext _context;

    public SettingsRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<StoreSettings> GetAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _context.StoreSettings
            .OrderBy(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (settings == null)
        {
            settings = new StoreSettings();
            _context.StoreSettings.Add(settings);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return settings;
    }

    public async Task UpdateAsync(StoreSettings settings, CancellationToken cancellationToken = default)
    {
        _context.StoreSettings.Update(settings);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
