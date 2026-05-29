using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.FullName).HasMaxLength(200).IsRequired();
        builder.Property(a => a.PhoneNumber).HasMaxLength(50).IsRequired();
        builder.Property(a => a.City).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Street).HasMaxLength(500).IsRequired();
        builder.Property(a => a.PostalCode).HasMaxLength(20);

        builder.HasIndex(a => a.UserId);
    }
}
