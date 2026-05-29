using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class DiscountConfiguration : IEntityTypeConfiguration<Discount>
{
    public void Configure(EntityTypeBuilder<Discount> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Percentage).HasPrecision(5, 2);
        builder.Property(d => d.Scope).HasConversion<int>();
        builder.HasIndex(d => new { d.Scope, d.TargetId });
        builder.HasIndex(d => d.IsActive);
    }
}
