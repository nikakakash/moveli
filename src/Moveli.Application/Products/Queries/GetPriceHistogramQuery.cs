using MediatR;
using Moveli.Application.Common;
using Moveli.Application.Products.DTOs;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.Products.Queries;

public record GetPriceHistogramQuery(
    int Buckets = 16,
    Guid? CategoryId = null,
    Guid? BrandId = null,
    decimal? MinRating = null,
    string? Search = null) : IRequest<Result<PriceHistogramDto>>;

public class GetPriceHistogramQueryHandler : IRequestHandler<GetPriceHistogramQuery, Result<PriceHistogramDto>>
{
    private readonly IProductRepository _productRepository;

    public GetPriceHistogramQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<PriceHistogramDto>> Handle(GetPriceHistogramQuery request, CancellationToken cancellationToken)
    {
        var (min, max, buckets) = await _productRepository.GetPriceHistogramAsync(
            request.Buckets,
            request.CategoryId, request.BrandId,
            request.MinRating, request.Search,
            cancellationToken);

        return Result<PriceHistogramDto>.Success(new PriceHistogramDto(min, max, buckets));
    }
}
