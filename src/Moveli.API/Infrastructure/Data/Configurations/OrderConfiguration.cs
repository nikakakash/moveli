using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.OrderNumber).HasMaxLength(20).IsRequired();
        builder.Property(o => o.CurrencyCode).HasMaxLength(10).HasDefaultValue("GEL");
        builder.Property(o => o.Notes).HasMaxLength(2000);
        builder.Property(o => o.PromoCode).HasMaxLength(50);

        builder.Property(o => o.SubTotal).HasPrecision(18, 2);
        builder.Property(o => o.ShippingCost).HasPrecision(18, 2);
        builder.Property(o => o.Discount).HasPrecision(18, 2);
        builder.Property(o => o.Total).HasPrecision(18, 2);

        builder.OwnsOne(o => o.ShippingAddress, sa =>
        {
            sa.Property(a => a.FullName).HasColumnName("ShippingFullName").HasMaxLength(200).IsRequired();
            sa.Property(a => a.PhoneNumber).HasColumnName("ShippingPhoneNumber").HasMaxLength(50).IsRequired();
            sa.Property(a => a.City).HasColumnName("ShippingCity").HasMaxLength(100).IsRequired();
            sa.Property(a => a.Street).HasColumnName("ShippingStreet").HasMaxLength(500).IsRequired();
            sa.Property(a => a.PostalCode).HasColumnName("ShippingPostalCode").HasMaxLength(20);
        });

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.ProductName).HasMaxLength(500).IsRequired();
        builder.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
        builder.Property(oi => oi.Total).HasPrecision(18, 2);

        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
