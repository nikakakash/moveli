using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface ISettingsRepository
{
    Task<StoreSettings> GetAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(StoreSettings settings, CancellationToken cancellationToken = default);
}
