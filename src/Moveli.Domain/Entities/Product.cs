using Moveli.Domain.ValueObjects;

namespace Moveli.Domain.Entities;

public class Product : BaseEntity
{
    public LocalizedString Name { get; set; } = new();
    public string Slug { get; set; } = string.Empty;
    public LocalizedString Description { get; set; } = new();
    public string? SKU { get; set; }

    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }

    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }

    public LocalizedString? MetaTitle { get; set; }
    public LocalizedString? MetaDescription { get; set; }
}
