using Moveli.Domain.Enums;

namespace Moveli.Application.PromoCodes.Dtos;

public record PromoCodeDto(
    Guid Id,
    string Code,
    PromoDiscountType Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    int? MaxRedemptions,
    int RedemptionCount);

public record CreatePromoCodeRequest(
    string Code,
    string Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    int? MaxRedemptions);

public record UpdatePromoCodeRequest(
    string Code,
    string Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    int? MaxRedemptions);
