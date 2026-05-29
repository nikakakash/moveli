using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public record UserBrief(Guid Id, string FullName, string Email);

public interface IReviewRepository
{
    Task<(List<Review> Items, int TotalCount)> GetByProductIdAsync(Guid productId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Review> AddAsync(Review review, CancellationToken cancellationToken = default);
    Task<bool> HasUserReviewedAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default);

    // Admin moderation
    Task<(List<Review> Items, int TotalCount)> GetAllAsync(int page, int pageSize, bool? isApproved, CancellationToken cancellationToken = default);
    Task<int> CountPendingAsync(CancellationToken cancellationToken = default);
    Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateAsync(Review review, CancellationToken cancellationToken = default);
    Task DeleteAsync(Review review, CancellationToken cancellationToken = default);
    Task RecomputeProductRatingAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, UserBrief>> GetUserBriefsAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken = default);
}
