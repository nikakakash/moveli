using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetTreeAsync(CancellationToken cancellationToken = default);
    Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> GetProductCountAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default);
    Task UpdateAsync(Category category, CancellationToken cancellationToken = default);
    Task DeleteAsync(Category category, CancellationToken cancellationToken = default);
    Task ReorderAsync(List<Guid> categoryIds, CancellationToken cancellationToken = default);
}
