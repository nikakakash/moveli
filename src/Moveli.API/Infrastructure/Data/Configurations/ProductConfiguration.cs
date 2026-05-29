using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.OwnsOne(p => p.Name, n =>
        {
            n.Property(l => l.Ka).HasColumnName("NameKa").HasMaxLength(500).IsRequired();
            n.Property(l => l.En).HasColumnName("NameEn").HasMaxLength(500).IsRequired();
        });

        builder.OwnsOne(p => p.Description, d =>
        {
            d.Property(l => l.Ka).HasColumnName("DescriptionKa").HasMaxLength(5000);
            d.Property(l => l.En).HasColumnName("DescriptionEn").HasMaxLength(5000);
        });

        builder.OwnsOne(p => p.MetaTitle, m =>
        {
            m.Property(l => l.Ka).HasColumnName("MetaTitleKa").HasMaxLength(200);
            m.Property(l => l.En).HasColumnName("MetaTitleEn").HasMaxLength(200);
        });

        builder.OwnsOne(p => p.MetaDescription, m =>
        {
            m.Property(l => l.Ka).HasColumnName("MetaDescriptionKa").HasMaxLength(500);
            m.Property(l => l.En).HasColumnName("MetaDescriptionEn").HasMaxLength(500);
        });

        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Slug).HasMaxLength(500).IsRequired();
        builder.Property(p => p.SKU).HasMaxLength(100);
        builder.Property(p => p.Price).HasPrecision(18, 2);
        builder.Property(p => p.CompareAtPrice).HasPrecision(18, 2);
        builder.Property(p => p.Rating).HasPrecision(3, 2);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Brand)
            .WithMany(b => b.Products)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.BrandId);
        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => p.IsFeatured);
    }
}
