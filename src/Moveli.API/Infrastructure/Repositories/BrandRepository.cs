using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class BrandRepository : IBrandRepository
{
    private readonly MoveliDbContext _context;

    public BrandRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<List<Brand>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Brands
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Brand?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Brands.FirstOrDefaultAsync(b => b.Slug == slug, cancellationToken);
    }

    public async Task<Brand?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Brands.FindAsync([id], cancellationToken);
    }

    public async Task<Brand> AddAsync(Brand brand, CancellationToken cancellationToken = default)
    {
        _context.Brands.Add(brand);
        await _context.SaveChangesAsync(cancellationToken);
        return brand;
    }

    public async Task UpdateAsync(Brand brand, CancellationToken cancellationToken = default)
    {
        _context.Brands.Update(brand);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Brand brand, CancellationToken cancellationToken = default)
    {
        _context.Brands.Remove(brand);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> GetProductCountAsync(Guid brandId, CancellationToken cancellationToken = default)
    {
        return await _context.Products.CountAsync(p => p.BrandId == brandId, cancellationToken);
    }
}
