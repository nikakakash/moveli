using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly MoveliDbContext _context;

    public ReviewRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Review> Items, int TotalCount)> GetByProductIdAsync(
        Guid productId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Review> AddAsync(Review review, CancellationToken cancellationToken = default)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);
        return review;
    }

    public async Task<bool> HasUserReviewedAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default)
    {
        return await _context.Reviews.AnyAsync(
            r => r.UserId == userId && r.ProductId == productId, cancellationToken);
    }

    public async Task<(List<Review> Items, int TotalCount)> GetAllAsync(
        int page, int pageSize, bool? isApproved, CancellationToken cancellationToken = default)
    {
        var query = _context.Reviews
            .Include(r => r.Product)
            .AsQueryable();

        if (isApproved.HasValue)
            query = query.Where(r => r.IsApproved == isApproved.Value);

        query = query.OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> CountPendingAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Reviews.CountAsync(r => !r.IsApproved, cancellationToken);
    }

    public async Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Reviews
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(Review review, CancellationToken cancellationToken = default)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Review review, CancellationToken cancellationToken = default)
    {
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RecomputeProductRatingAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var approved = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .Select(r => r.Rating)
            .ToListAsync(cancellationToken);

        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        if (product == null) return;

        product.ReviewCount = approved.Count;
        product.Rating = approved.Count > 0
            ? Math.Round((decimal)approved.Average(), 2, MidpointRounding.AwayFromZero)
            : 0m;

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Dictionary<Guid, UserBrief>> GetUserBriefsAsync(
        IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken = default)
    {
        if (userIds.Count == 0) return new Dictionary<Guid, UserBrief>();

        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
            .ToListAsync(cancellationToken);

        return users.ToDictionary(
            u => u.Id,
            u => new UserBrief(u.Id, $"{u.FirstName} {u.LastName}".Trim(), u.Email ?? string.Empty));
    }
}
