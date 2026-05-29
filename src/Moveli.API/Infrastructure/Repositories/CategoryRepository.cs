using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly MoveliDbContext _context;

    public CategoryRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetTreeAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Include(c => c.Children)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
    }

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<int> GetProductCountAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.Products.CountAsync(p => p.CategoryId == categoryId, cancellationToken);
    }

    public async Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Category category, CancellationToken cancellationToken = default)
    {
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderAsync(List<Guid> categoryIds, CancellationToken cancellationToken = default)
    {
        var categories = await _context.Categories
            .Where(c => categoryIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        var categoryDict = categories.ToDictionary(c => c.Id);

        for (var i = 0; i < categoryIds.Count; i++)
        {
            if (categoryDict.TryGetValue(categoryIds[i], out var category))
                category.SortOrder = i;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
