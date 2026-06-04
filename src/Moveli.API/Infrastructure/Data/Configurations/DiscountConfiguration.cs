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

        builder.OwnsOne(d => d.Title, t =>
        {
            t.Property(l => l.Ka).HasColumnName("TitleKa").HasMaxLength(200);
            t.Property(l => l.En).HasColumnName("TitleEn").HasMaxLength(200);
        });
        builder.Property(d => d.ImageUrl).HasMaxLength(500);
        builder.Property(d => d.Placement).HasConversion<int>();
        builder.HasIndex(d => d.Placement);
    }
}
