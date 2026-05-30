using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Identity;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data;

public class MoveliDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public MoveliDbContext(DbContextOptions<MoveliDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Discount> Discounts => Set<Discount>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<PromoCodeRedemption> PromoCodeRedemptions => Set<PromoCodeRedemption>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(MoveliDbContext).Assembly);

        // Optimistic concurrency on read-modify-write rows via Postgres's system "xmin" column.
        // Npgsql special-cases this name, so the shadow property maps to the existing system
        // column — no schema/migration. Guarded to Npgsql so SQLite (tests) stays token-free.
        if (Database.IsNpgsql())
        {
            // Npgsql's concurrency-token convention detects a uint OnAddOrUpdate concurrency-token
            // property and maps it to the xmin system column (excluded from migrations). Don't set
            // column name/type — that defeats the convention and makes the differ emit AddColumn.
            builder.Entity<Product>().Property<uint>("xmin").IsRowVersion();
            builder.Entity<StoreSettings>().Property<uint>("xmin").IsRowVersion();
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
