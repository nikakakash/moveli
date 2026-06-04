using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Deals.DTOs;
using Moveli.Application.Discounts;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Deals.Queries;

// Live, curated deals (discounts whose Placement != None). Optionally filtered by placement
// and/or "show on home". Product-scoped deals carry a priced ProductListDto for card rendering.
public record GetDealsQuery(string? Placement = null, bool HomeOnly = false)
    : IRequest<Result<List<DealDto>>>;

public class GetDealsQueryHandler : IRequestHandler<GetDealsQuery, Result<List<DealDto>>>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IDiscountService _discountService;

    public GetDealsQueryHandler(
        IDiscountRepository discountRepository,
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository,
        IDiscountService discountService)
    {
        _discountRepository = discountRepository;
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _discountService = discountService;
    }

    public async Task<Result<List<DealDto>>> Handle(GetDealsQuery request, CancellationToken cancellationToken)
    {
        DealPlacement? placementFilter = null;
        if (!string.IsNullOrWhiteSpace(request.Placement)
            && Enum.TryParse<DealPlacement>(request.Placement, true, out var parsed))
            placementFilter = parsed;

        var live = await _discountRepository.GetLiveAsync(cancellationToken);
        var deals = live
            .Where(d => d.Placement != DealPlacement.None)
            .Where(d => placementFilter == null || d.Placement == placementFilter)
            .Where(d => !request.HomeOnly || d.ShowOnHome)
            .OrderBy(d => d.EndsAt ?? DateTime.MaxValue)
            .ThenByDescending(d => d.CreatedAt)
            .ToList();

        var snapshot = await _discountService.CreateSnapshotAsync(cancellationToken);

        var dtos = new List<DealDto>(deals.Count);
        foreach (var d in deals)
        {
            string targetName;
            ProductListDto? product = null;

            switch (d.Scope)
            {
                case DiscountScope.Product:
                    var p = await _productRepository.GetByIdAsync(d.TargetId, cancellationToken);
                    targetName = p?.Name.En ?? "(deleted)";
                    if (p is { IsActive: true })
                        product = MapProduct(p, snapshot);
                    break;
                case DiscountScope.Category:
                    targetName = (await _categoryRepository.GetByIdAsync(d.TargetId, cancellationToken))?.Name.En ?? "(deleted)";
                    break;
                case DiscountScope.Brand:
                    targetName = (await _brandRepository.GetByIdAsync(d.TargetId, cancellationToken))?.Name ?? "(deleted)";
                    break;
                default:
                    targetName = "(deleted)";
                    break;
            }

            dtos.Add(new DealDto(
                d.Id, d.Scope.ToString(), d.TargetId, targetName, d.Percentage,
                d.Title.Ka, d.Title.En, d.ImageUrl, d.Placement.ToString(),
                d.ShowOnHome, d.ShowCountdown, d.StartsAt, d.EndsAt, product));
        }

        return Result<List<DealDto>>.Success(dtos);
    }

    private static ProductListDto MapProduct(Product p, DiscountSnapshot snapshot)
    {
        var (price, compareAtPrice) = snapshot.Apply(p);
        return new ProductListDto(
            p.Id, p.Name.Ka, p.Name.En, p.Slug, price, compareAtPrice,
            p.Images.FirstOrDefault(i => i.IsMain)?.Url ?? p.Images.FirstOrDefault()?.Url,
            p.Category.Name.Ka, p.Category.Name.En, p.Brand.Name,
            p.IsActive, p.IsFeatured, p.Rating, p.ReviewCount, p.StockQuantity);
    }
}
