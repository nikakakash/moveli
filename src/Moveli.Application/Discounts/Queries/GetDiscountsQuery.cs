using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Discounts.DTOs;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Discounts.Queries;

public record GetDiscountsQuery(int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<DiscountDto>>>;

public class GetDiscountsQueryHandler : IRequestHandler<GetDiscountsQuery, Result<PagedResult<DiscountDto>>>
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

    public async Task<Result<PagedResult<DiscountDto>>> Handle(GetDiscountsQuery request, CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var (discounts, total) = await _discountRepository.GetPagedAsync(page, pageSize, cancellationToken);

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

        return Result<PagedResult<DiscountDto>>.Success(
            new PagedResult<DiscountDto>(dtos, total, page, pageSize));
    }
}
