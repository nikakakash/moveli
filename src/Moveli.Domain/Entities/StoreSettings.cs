namespace Moveli.Domain.Entities;

public class StoreSettings : BaseEntity
{
    public string StoreName { get; set; } = "MOveli";
    public string SupportEmail { get; set; } = string.Empty;
    public string SupportPhone { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = "GEL";

    // Shipping
    public decimal FreeShippingThreshold { get; set; } = 100m;
    public decimal ShippingCost { get; set; } = 5m;
    public string FreeShippingCity { get; set; } = "Tbilisi";

    // Storefront toggles
    public bool MaintenanceMode { get; set; }
    public string? AnnouncementEn { get; set; }
    public string? AnnouncementKa { get; set; }
}
