using Moveli.Application.Discounts;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Entities;

namespace Moveli.Application.Products;

public static class ProductMappingExtensions
{
    /// <summary>
    /// Single source of truth for Product -> ProductListDto. Applies the live discount
    /// snapshot so every listing surface (catalog, category, featured, deals) prices
    /// products identically. Requires Category, Brand, and Images to be loaded.
    /// </summary>
    public static ProductListDto ToListDto(this Product product, DiscountSnapshot discounts)
    {
        var (price, compareAtPrice) = discounts.Apply(product);
        return new ProductListDto(
            product.Id,
            product.Name.Ka,
            product.Name.En,
            product.Slug,
            price,
            compareAtPrice,
            product.Images.FirstOrDefault(i => i.IsMain)?.Url ?? product.Images.FirstOrDefault()?.Url,
            product.Category.Name.Ka,
            product.Category.Name.En,
            product.Brand.Name,
            product.IsActive,
            product.IsFeatured,
            product.Rating,
            product.ReviewCount,
            product.StockQuantity);
    }
}
