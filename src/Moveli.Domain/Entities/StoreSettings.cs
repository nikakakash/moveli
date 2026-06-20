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
    // Flat rate charged for every city other than FreeShippingCity.
    public decimal RegionalShippingCost { get; set; } = 14m;
    // Must match the city string the storefront sends at checkout (the checkout city
    // dropdown uses Georgian names), otherwise the free-shipping rule never matches.
    public string FreeShippingCity { get; set; } = "თბილისი";

    // Minimum subtotal required to place an order. Single-sourced here so the storefront
    // and checkout enforce the same value (the cart/checkout read it from public settings).
    public decimal MinOrderTotal { get; set; } = 30m;

    // Storefront toggles
    public bool MaintenanceMode { get; set; }
    public string? AnnouncementEn { get; set; }
    public string? AnnouncementKa { get; set; }

    // Hero image cluster on the home page — admin uploads two photos that appear
    // in the right-hand collage. Nullable: when null the storefront falls back to
    // the curated default (currently a Nike sneaker + Sony headphones from Unsplash).
    public string? HeroImagePrimaryUrl { get; set; }
    public string? HeroImageSecondaryUrl { get; set; }

    // Same two-photo collage on the /deals page hero. Independent from the home hero
    // so admins can promote a different pair (e.g., the actual products on sale).
    public string? DealsHeroImagePrimaryUrl { get; set; }
    public string? DealsHeroImageSecondaryUrl { get; set; }
}
