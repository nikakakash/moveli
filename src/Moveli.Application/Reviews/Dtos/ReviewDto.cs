namespace Moveli.Application.Reviews.DTOs;

public record ReviewDto(Guid Id, Guid ProductId, Guid UserId, int Rating, string? Comment, bool IsApproved, DateTime CreatedAt);

public record CreateReviewRequest(int Rating, string? Comment);

public record AdminReviewDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductSlug,
    Guid UserId,
    string UserName,
    string UserEmail,
    int Rating,
    string? Comment,
    bool IsApproved,
    DateTime CreatedAt);
