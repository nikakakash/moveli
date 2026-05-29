using Moveli.Domain.ValueObjects;

namespace Moveli.Domain.Entities;

public class Category : BaseEntity
{
    public LocalizedString Name { get; set; } = new();
    public string Slug { get; set; } = string.Empty;
    public LocalizedString? Description { get; set; }

    public Guid? ParentCategoryId { get; set; }
    public Category? Parent { get; set; }
    public ICollection<Category> Children { get; set; } = new List<Category>();

    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
