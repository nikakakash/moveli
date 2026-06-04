using Moveli.Application.Products.DTOs;

namespace Moveli.Application.Deals.DTOs;

public record DealDto(
    Guid Id,
    string Scope,
    Guid TargetId,
    string TargetName,
    decimal Percentage,
    string TitleKa,
    string TitleEn,
    string? ImageUrl,
    string Placement,
    bool ShowOnHome,
    bool ShowCountdown,
    DateTime? StartsAt,
    DateTime? EndsAt,
    ProductListDto? Product);
