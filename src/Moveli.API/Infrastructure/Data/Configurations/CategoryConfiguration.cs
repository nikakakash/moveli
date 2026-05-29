using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);

        builder.OwnsOne(c => c.Name, n =>
        {
            n.Property(l => l.Ka).HasColumnName("NameKa").HasMaxLength(200).IsRequired();
            n.Property(l => l.En).HasColumnName("NameEn").HasMaxLength(200).IsRequired();
        });

        builder.OwnsOne(c => c.Description, d =>
        {
            d.Property(l => l.Ka).HasColumnName("DescriptionKa").HasMaxLength(2000);
            d.Property(l => l.En).HasColumnName("DescriptionEn").HasMaxLength(2000);
        });

        builder.HasIndex(c => c.Slug).IsUnique();
        builder.Property(c => c.Slug).HasMaxLength(200).IsRequired();
        builder.Property(c => c.ImageUrl).HasMaxLength(1000);

        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
