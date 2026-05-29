using Moveli.Application.Products.DTOs;

namespace Moveli.Application.Wishlists.DTOs;

public record WishlistItemDto(Guid Id, Guid ProductId, ProductListDto Product, DateTime AddedAt);
