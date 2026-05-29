using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts.Commands;

public record CreateDiscountCommand(
    string Scope,
    Guid TargetId,
    decimal Percentage,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt) : IRequest<Result<Guid>>;

public class CreateDiscountCommandValidator : AbstractValidator<CreateDiscountCommand>
{
    public CreateDiscountCommandValidator()
    {
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

public class CreateDiscountCommandHandler : IRequestHandler<CreateDiscountCommand, Result<Guid>>
{
    private readonly IDiscountRepository _discountRepository;

    public CreateDiscountCommandHandler(IDiscountRepository discountRepository)
    {
        _discountRepository = discountRepository;
    }

    public async Task<Result<Guid>> Handle(CreateDiscountCommand request, CancellationToken cancellationToken)
    {
        var scope = Enum.Parse<DiscountScope>(request.Scope, true);

        var discount = new Discount
        {
            Scope = scope,
            TargetId = request.TargetId,
            Percentage = request.Percentage,
            IsActive = request.IsActive,
            StartsAt = request.StartsAt?.ToUniversalTime(),
            EndsAt = request.EndsAt?.ToUniversalTime()
        };

        discount = await _discountRepository.AddAsync(discount, cancellationToken);
        return Result<Guid>.Success(discount.Id);
    }
}
