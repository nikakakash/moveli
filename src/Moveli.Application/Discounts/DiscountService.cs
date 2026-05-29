using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts;

public class DiscountService : IDiscountService
{
    private readonly IDiscountRepository _discountRepository;

    public DiscountService(IDiscountRepository discountRepository)
    {
        _discountRepository = discountRepository;
    }

    public async Task<DiscountSnapshot> CreateSnapshotAsync(CancellationToken cancellationToken = default)
    {
        var live = await _discountRepository.GetLiveAsync(cancellationToken);

        var byProduct = new Dictionary<Guid, decimal>();
        var byCategory = new Dictionary<Guid, decimal>();
        var byBrand = new Dictionary<Guid, decimal>();

        foreach (var d in live)
        {
            var target = d.Scope switch
            {
                DiscountScope.Product => byProduct,
                DiscountScope.Category => byCategory,
                DiscountScope.Brand => byBrand,
                _ => null
            };

            if (target is null) continue;

            // If multiple live discounts target the same id, keep the largest.
            if (!target.TryGetValue(d.TargetId, out var existing) || d.Percentage > existing)
                target[d.TargetId] = d.Percentage;
        }

        return new DiscountSnapshot(byProduct, byCategory, byBrand);
    }
}
