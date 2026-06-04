using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(EntityTypeBuilder<StoreSettings> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.StoreName).HasMaxLength(200).IsRequired();
        builder.Property(s => s.SupportEmail).HasMaxLength(200);
        builder.Property(s => s.SupportPhone).HasMaxLength(50);
        builder.Property(s => s.CurrencyCode).HasMaxLength(10);
        builder.Property(s => s.FreeShippingCity).HasMaxLength(100);
        builder.Property(s => s.FreeShippingThreshold).HasPrecision(18, 2);
        builder.Property(s => s.ShippingCost).HasPrecision(18, 2);
        builder.Property(s => s.AnnouncementEn).HasMaxLength(500);
        builder.Property(s => s.AnnouncementKa).HasMaxLength(500);
        builder.Property(s => s.HeroImagePrimaryUrl).HasMaxLength(500);
        builder.Property(s => s.HeroImageSecondaryUrl).HasMaxLength(500);
        builder.Property(s => s.DealsHeroImagePrimaryUrl).HasMaxLength(500);
        builder.Property(s => s.DealsHeroImageSecondaryUrl).HasMaxLength(500);
    }
}
