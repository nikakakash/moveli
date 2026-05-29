using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class AddressRepository : IAddressRepository
{
    private readonly MoveliDbContext _context;

    public AddressRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<List<Address>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Address?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Address> AddAsync(Address address, CancellationToken cancellationToken = default)
    {
        _context.Addresses.Add(address);
        await _context.SaveChangesAsync(cancellationToken);
        return address;
    }

    public async Task UpdateAsync(Address address, CancellationToken cancellationToken = default)
    {
        _context.Addresses.Update(address);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Address address, CancellationToken cancellationToken = default)
    {
        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearDefaultAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var defaults = await _context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var a in defaults)
            a.IsDefault = false;

        if (defaults.Count > 0)
            await _context.SaveChangesAsync(cancellationToken);
    }
}
