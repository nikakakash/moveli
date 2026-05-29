namespace Moveli.Application.Cart.DTOs;

public record CartDto(
    Guid Id,
    List<CartItemDto> Items,
    decimal Total);

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductNameKa,
    string ProductNameEn,
    string ProductSlug,
    string? ProductImageUrl,
    int Quantity,
    decimal UnitPrice,
    decimal Total);

public record AddCartItemRequest(Guid ProductId, int Quantity = 1);

public record UpdateCartItemRequest(int Quantity);
