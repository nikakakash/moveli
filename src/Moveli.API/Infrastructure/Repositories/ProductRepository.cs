using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly MoveliDbContext _context;

    public ProductRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Product> Items, int TotalCount)> GetProductsAsync(
        int page, int pageSize,
        Guid? categoryId = null, Guid? brandId = null,
        decimal? minPrice = null, decimal? maxPrice = null,
        string? search = null, string? sortBy = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (brandId.HasValue)
            query = query.Where(p => p.BrandId == brandId.Value);

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(p =>
                p.Name.Ka.ToLower().Contains(term) ||
                p.Name.En.ToLower().Contains(term) ||
                p.Description.Ka.ToLower().Contains(term) ||
                p.Description.En.ToLower().Contains(term));
        }

        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "name" => query.OrderBy(p => p.Name.En),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "rating" => query.OrderByDescending(p => p.Rating),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<List<Product>> GetFeaturedAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsFeatured && p.IsActive)
            .OrderByDescending(p => p.Rating)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        // The product is normally loaded (and tracked) before being updated, so its
        // change graph is tracked. Only force Update() when the entity is detached.
        if (_context.Entry(product).State == EntityState.Detached)
            _context.Products.Update(product);

        // BaseEntity assigns Id = Guid.NewGuid() in its constructor, so every freshly
        // created ProductImage carries a non-default key. When EF discovers such a
        // child reachable from an already-tracked product, its key heuristic assumes
        // the row already exists and marks it Modified — producing an UPDATE that
        // affects 0 rows and throws DbUpdateConcurrencyException. In this codebase
        // images are only ever replaced (cleared + recreated), never edited in place,
        // so any ProductImage detected as Modified is in fact a brand-new row: flip
        // it to Added so EF emits an INSERT instead.
        foreach (var entry in _context.ChangeTracker.Entries<ProductImage>())
        {
            if (entry.State == EntityState.Modified)
                entry.State = EntityState.Added;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
