using MediatR;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Application.Common;
using Moveli.Application.Orders.Commands;
using Moveli.Application.Orders.DTOs;
using Moveli.Application.PromoCodes;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;
using Moveli.Domain.ValueObjects;

namespace Moveli.API.Infrastructure.Orders;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly MoveliDbContext _context;
    private readonly IPromoCodeService _promoCodeService;

    public CreateOrderCommandHandler(IOrderRepository orderRepository, ICartRepository cartRepository, MoveliDbContext context, IPromoCodeService promoCodeService)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _context = context;
        _promoCodeService = promoCodeService;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var cart = await _cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
            if (cart == null || !cart.Items.Any())
                return Result<OrderDto>.Failure("Cart is empty.");

            foreach (var cartItem in cart.Items)
            {
                var product = await _context.Products.FindAsync([cartItem.ProductId], cancellationToken);
                if (product == null || !product.IsActive)
                    return Result<OrderDto>.Failure($"Product '{cartItem.Product.Name.En}' is no longer available.");
                if (product.StockQuantity < cartItem.Quantity)
                    return Result<OrderDto>.Failure($"Not enough stock for '{cartItem.Product.Name.En}'. Available: {product.StockQuantity}.");
            }

            var orderNumber = await _orderRepository.GenerateOrderNumberAsync(cancellationToken);

            var order = new Order
            {
                UserId = request.UserId,
                OrderNumber = orderNumber,
                Status = OrderStatus.Pending,
                ShippingAddress = new ShippingAddress
                {
                    FullName = request.ShippingFullName,
                    PhoneNumber = request.ShippingPhoneNumber,
                    City = request.ShippingCity,
                    Street = request.ShippingStreet,
                    PostalCode = request.ShippingPostalCode
                },
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                Notes = request.Notes
            };

            foreach (var cartItem in cart.Items)
            {
                order.Items.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    ProductName = cartItem.Product.Name.En,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.UnitPrice,
                    Total = cartItem.UnitPrice * cartItem.Quantity
                });

                var product = await _context.Products.FindAsync([cartItem.ProductId], cancellationToken);
                product!.StockQuantity -= cartItem.Quantity;
            }

            order.SubTotal = order.Items.Sum(i => i.Total);

            // Minimum order validation
            if (order.SubTotal < 30)
                return Result<OrderDto>.Failure("Minimum order amount is ₾30.");

            // Shipping cost calculation
            bool isTbilisi = string.Equals(request.ShippingCity, "თბილისი", StringComparison.OrdinalIgnoreCase);
            if (isTbilisi)
                order.ShippingCost = order.SubTotal >= 100 ? 0 : 5;
            else
                order.ShippingCost = 14;

            order.Discount = 0m;
            PromoValidationResult? appliedPromo = null;
            if (!string.IsNullOrWhiteSpace(request.PromoCode))
            {
                var promoResult = await _promoCodeService.ValidateAsync(
                    request.PromoCode, order.SubTotal, request.UserId, cancellationToken);
                if (!promoResult.IsSuccess)
                    return Result<OrderDto>.Failure(promoResult.Error!);

                appliedPromo = promoResult.Value!;
                order.Discount = appliedPromo.DiscountAmount;
                order.PromoCode = appliedPromo.Code;
            }

            order.Total = order.SubTotal + order.ShippingCost - order.Discount;

            _context.Orders.Add(order);

            var cartItems = await _context.Set<CartItem>().Where(i => i.CartId == cart.Id).ToListAsync(cancellationToken);
            _context.Set<CartItem>().RemoveRange(cartItems);

            await _context.SaveChangesAsync(cancellationToken);

            if (appliedPromo != null)
            {
                _context.PromoCodeRedemptions.Add(new PromoCodeRedemption
                {
                    PromoCodeId = appliedPromo.PromoCodeId,
                    UserId = request.UserId,
                    OrderId = order.Id
                });
                await _context.SaveChangesAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);

            return Result<OrderDto>.Success(MapToDto(order));
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private static OrderDto MapToDto(Order order) => new(
        order.Id,
        order.OrderNumber,
        order.Status,
        order.ShippingAddress.FullName,
        order.ShippingAddress.PhoneNumber,
        order.ShippingAddress.City,
        order.ShippingAddress.Street,
        order.ShippingAddress.PostalCode,
        order.PaymentMethod,
        order.PaymentStatus,
        order.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.Total)).ToList(),
        order.SubTotal,
        order.ShippingCost,
        order.Discount,
        order.PromoCode,
        order.Total,
        order.CurrencyCode,
        order.Notes,
        order.CreatedAt);
}
