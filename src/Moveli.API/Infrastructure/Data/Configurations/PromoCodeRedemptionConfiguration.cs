using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class PromoCodeRedemptionConfiguration : IEntityTypeConfiguration<PromoCodeRedemption>
{
    public void Configure(EntityTypeBuilder<PromoCodeRedemption> builder)
    {
        builder.HasIndex(r => new { r.PromoCodeId, r.UserId }).IsUnique();
    }
}
