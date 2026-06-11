using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moveli.API.Infrastructure.Data;
using Moveli.Application.Common;
using Moveli.Application.Discounts;
using Moveli.Application.Orders;
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
    // NOTE(nika): minimum order and the regional (non-free-shipping-city) flat rate are not yet
    // admin-configurable; the free-shipping threshold, in-city cost, and city come from StoreSettings.
    private const decimal MinOrderTotal = 30m;
    private const decimal RegionalShippingCost = 14m;

    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly MoveliDbContext _context;
    private readonly IPromoCodeService _promoCodeService;
    private readonly ISettingsRepository _settingsRepository;
    private readonly IDiscountService _discountService;
    private readonly IUserLookup _userLookup;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateOrderCommandHandler> _logger;

    public CreateOrderCommandHandler(
        IOrderRepository orderRepository,
        ICartRepository cartRepository,
        MoveliDbContext context,
        IPromoCodeService promoCodeService,
        ISettingsRepository settingsRepository,
        IDiscountService discountService,
        IUserLookup userLookup,
        IEmailService emailService,
        ILogger<CreateOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _context = context;
        _promoCodeService = promoCodeService;
        _settingsRepository = settingsRepository;
        _discountService = discountService;
        _userLookup = userLookup;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var cart = await _cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
            if (cart == null || !cart.Items.Any())
                return Result<OrderDto>.Failure("Cart is empty.");

            // Consume the cart atomically up front: this is the idempotency gate. A concurrent
            // duplicate checkout (double-click / retry) blocks here, then sees 0 rows deleted
            // because the winner already emptied the cart — so it can never create a second order.
            var consumed = await _context.Set<CartItem>()
                .Where(i => i.CartId == cart.Id)
                .ExecuteDeleteAsync(cancellationToken);
            if (consumed == 0)
                return Result<OrderDto>.Failure("This cart has already been checked out.");

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

            // Re-price every line against the current product price + live discounts at checkout.
            // The cart's stored UnitPrice is a display snapshot from add-to-cart time and must not
            // be trusted to charge (carts persist for weeks; flash discounts expire).
            var discounts = await _discountService.CreateSnapshotAsync(cancellationToken);

            foreach (var cartItem in cart.Items)
            {
                // Atomic conditional decrement: the WHERE guard makes overselling impossible
                // regardless of concurrency. 0 rows affected => gone, inactive, or insufficient stock.
                var affected = await _context.Products
                    .Where(p => p.Id == cartItem.ProductId
                             && p.IsActive
                             && p.StockQuantity >= cartItem.Quantity)
                    .ExecuteUpdateAsync(
                        s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity - cartItem.Quantity),
                        cancellationToken);

                if (affected == 0)
                    return Result<OrderDto>.Failure(
                        $"'{cartItem.Product.Name.En}' is unavailable or out of stock.");

                var (unitPrice, _) = discounts.Apply(cartItem.Product);

                order.Items.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    ProductName = cartItem.Product.Name.En,
                    Quantity = cartItem.Quantity,
                    UnitPrice = unitPrice,
                    Total = unitPrice * cartItem.Quantity
                });
            }

            order.SubTotal = order.Items.Sum(i => i.Total);

            // Minimum order validation
            if (order.SubTotal < MinOrderTotal)
                return Result<OrderDto>.Failure($"Minimum order amount is ₾{MinOrderTotal:0}.");

            // Shipping: admin-configured free-shipping city gets free delivery above the
            // threshold (flat in-city cost below it); all other regions pay the flat regional rate.
            var settings = await _settingsRepository.GetAsync(cancellationToken);
            var isFreeShippingCity = string.Equals(
                request.ShippingCity?.Trim(), settings.FreeShippingCity?.Trim(), StringComparison.OrdinalIgnoreCase);
            order.ShippingCost = isFreeShippingCity
                ? (order.SubTotal >= settings.FreeShippingThreshold ? 0m : settings.ShippingCost)
                : RegionalShippingCost;

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

            await _context.SaveChangesAsync(cancellationToken);

            if (appliedPromo != null)
            {
                _context.PromoCodeRedemptions.Add(new PromoCodeRedemption
                {
                    PromoCodeId = appliedPromo.PromoCodeId,
                    UserId = request.UserId,
                    OrderId = order.Id
                });
                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (DbUpdateException ex) when (DbConcurrency.IsUniqueViolation(ex))
                {
                    // A concurrent order already redeemed this single-use code for the user.
                    await transaction.RollbackAsync(cancellationToken);
                    return Result<OrderDto>.Failure("This promo code has already been used.");
                }

                // Enforce the global redemption cap atomically. The conditional UPDATE takes a row
                // lock on the PromoCode row, so concurrent checkouts serialize here and re-evaluate
                // the live redemption count (including the row each just inserted) against the cap.
                if (appliedPromo.MaxRedemptions is int cap)
                {
                    var withinCap = await _context.PromoCodes
                        .Where(p => p.Id == appliedPromo.PromoCodeId
                            && _context.PromoCodeRedemptions.Count(r => r.PromoCodeId == p.Id) <= cap)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.UpdatedAt, DateTime.UtcNow), cancellationToken);
                    if (withinCap == 0)
                    {
                        await transaction.RollbackAsync(cancellationToken);
                        return Result<OrderDto>.Failure("This promo code is no longer available.");
                    }
                }
            }

            await transaction.CommitAsync(cancellationToken);

            await TrySendConfirmationAsync(order, request.UserId, cancellationToken);

            return Result<OrderDto>.Success(order.ToDto());
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    // Best-effort order confirmation email — never fails the (already committed) order.
    private async Task TrySendConfirmationAsync(Order order, Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var email = await _userLookup.GetEmailAsync(userId, cancellationToken);
            if (string.IsNullOrEmpty(email)) return;

            var lines = string.Join("", order.Items.Select(i =>
                $"<li>{i.ProductName} × {i.Quantity} — {i.Total:0.00} ₾</li>"));
            var body = $"""
                <p>Thank you for your order <strong>{order.OrderNumber}</strong>.</p>
                <ul>{lines}</ul>
                <p>Subtotal: {order.SubTotal:0.00} ₾<br/>Shipping: {order.ShippingCost:0.00} ₾<br/>
                Discount: {order.Discount:0.00} ₾<br/><strong>Total: {order.Total:0.00} ₾</strong></p>
                <p>Payment: cash on delivery. We'll notify you as your order progresses.</p>
                """;
            await _emailService.SendAsync(email, $"Order {order.OrderNumber} confirmed", body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order confirmation email for {OrderNumber}", order.OrderNumber);
        }
    }
}
