namespace Moveli.Application.Discounts.DTOs;

public record DiscountDto(
    Guid Id,
    string Scope,
    Guid TargetId,
    string TargetName,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    string TitleKa,
    string TitleEn,
    string? ImageUrl,
    string Placement,
    bool ShowOnHome,
    bool ShowCountdown);

public record CreateDiscountRequest(
    string Scope,
    Guid TargetId,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    string? TitleKa = null,
    string? TitleEn = null,
    string? ImageUrl = null,
    string Placement = "None",
    bool ShowOnHome = false,
    bool ShowCountdown = false);

public record UpdateDiscountRequest(
    string Scope,
    Guid TargetId,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    string? TitleKa = null,
    string? TitleEn = null,
    string? ImageUrl = null,
    string Placement = "None",
    bool ShowOnHome = false,
    bool ShowCountdown = false);
