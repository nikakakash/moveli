using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts.Commands;

public record UpdateDiscountCommand(
    Guid Id,
    string Scope,
    Guid TargetId,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt) : IRequest<Result>;

public class UpdateDiscountCommandValidator : AbstractValidator<UpdateDiscountCommand>
{
    public UpdateDiscountCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Scope).Must(s => Enum.TryParse<DiscountScope>(s, true, out _))
            .WithMessage("Scope must be Product, Category or Brand.");
        RuleFor(x => x.TargetId).NotEmpty();
        RuleFor(x => x.Percentage).GreaterThan(0).LessThanOrEqualTo(100);
        RuleFor(x => x.EndsAt)
            .GreaterThanOrEqualTo(x => x.StartsAt!.Value)
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue)
            .WithMessage("End date must be after start date.");
    }
}

public class UpdateDiscountCommandHandler : IRequestHandler<UpdateDiscountCommand, Result>
{
    private readonly IDiscountRepository _discountRepository;

    public UpdateDiscountCommandHandler(IDiscountRepository discountRepository)
    {
        _discountRepository = discountRepository;
    }

    public async Task<Result> Handle(UpdateDiscountCommand request, CancellationToken cancellationToken)
    {
        var discount = await _discountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (discount == null)
            return Result.Failure("Discount not found.");

        discount.Scope = Enum.Parse<DiscountScope>(request.Scope, true);
        discount.TargetId = request.TargetId;
        discount.Percentage = request.Percentage;
        discount.IsActive = request.IsActive;
        discount.StartsAt = request.StartsAt?.ToUniversalTime();
        discount.EndsAt = request.EndsAt?.ToUniversalTime();

        await _discountRepository.UpdateAsync(discount, cancellationToken);
        return Result.Success();
    }
}
