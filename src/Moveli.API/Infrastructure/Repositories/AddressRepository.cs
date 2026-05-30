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
        // Set-based update: atomic, no read-modify-write window.
        await _context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false), cancellationToken);
    }

    public async Task SetDefaultAsync(Guid userId, Guid addressId, CancellationToken cancellationToken = default)
    {
        // Clear-then-set as two set-based statements in one transaction. Concurrent calls
        // serialize via row locks, so the result is always exactly one default.
        await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);
        await _context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false), cancellationToken);
        await _context.Addresses
            .Where(a => a.Id == addressId && a.UserId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, true), cancellationToken);
        await tx.CommitAsync(cancellationToken);
    }
}
