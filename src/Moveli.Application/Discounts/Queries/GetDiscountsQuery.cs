using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts.DTOs;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts.Queries;

public record GetDiscountsQuery : IRequest<Result<List<DiscountDto>>>;

public class GetDiscountsQueryHandler : IRequestHandler<GetDiscountsQuery, Result<List<DiscountDto>>>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;

    public GetDiscountsQueryHandler(
        IDiscountRepository discountRepository,
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository)
    {
        _discountRepository = discountRepository;
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
    }

    public async Task<Result<List<DiscountDto>>> Handle(GetDiscountsQuery request, CancellationToken cancellationToken)
    {
        var discounts = await _discountRepository.GetAllAsync(cancellationToken);

        var dtos = new List<DiscountDto>(discounts.Count);
        foreach (var d in discounts)
        {
            var targetName = d.Scope switch
            {
                DiscountScope.Product => (await _productRepository.GetByIdAsync(d.TargetId, cancellationToken))?.Name.En,
                DiscountScope.Category => (await _categoryRepository.GetByIdAsync(d.TargetId, cancellationToken))?.Name.En,
                DiscountScope.Brand => (await _brandRepository.GetByIdAsync(d.TargetId, cancellationToken))?.Name,
                _ => null
            } ?? "(deleted)";

            dtos.Add(new DiscountDto(
                d.Id,
                d.Scope.ToString(),
                d.TargetId,
                targetName,
                d.Percentage,
                d.IsActive,
                d.StartsAt,
                d.EndsAt,
                d.Title.Ka,
                d.Title.En,
                d.ImageUrl,
                d.Placement.ToString(),
                d.ShowOnHome,
                d.ShowCountdown));
        }

        return Result<List<DiscountDto>>.Success(dtos);
    }
}
