namespace Moveli.Application.Discounts.DTOs;

public record DiscountDto(
    Guid Id,
    string Scope,
    Guid TargetId,
    string TargetName,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt);

public record CreateDiscountRequest(
    string Scope,
    Guid TargetId,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt);

public record UpdateDiscountRequest(
    string Scope,
    Guid TargetId,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt);
