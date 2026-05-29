namespace Moveli.Domain.Entities;

public class PromoCodeRedemption : BaseEntity
{
    public Guid PromoCodeId { get; set; }
    public Guid UserId { get; set; }
    public Guid OrderId { get; set; }
}
