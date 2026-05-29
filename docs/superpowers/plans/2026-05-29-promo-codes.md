# Promo Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins create promo codes (percentage or fixed ₾ amount) and let customers redeem one code per order at checkout for a discount, validated server-side.

**Architecture:** A new `PromoCode` domain entity holds the code, type, value, active flag, and optional date window. A `PromoCodeRedemption` entity tracks once-per-customer usage (unique index on `(PromoCodeId, UserId)`). A shared `IPromoCodeService` does the validation + discount math; the checkout's "Apply" button calls a customer `validate` endpoint, and `CreateOrderCommandHandler` re-validates authoritatively, sets `order.Discount`/`order.PromoCode`, and writes a redemption row inside the existing transaction. Admin CRUD mirrors the existing `AdminDiscountsController`. The promo discount plugs into the existing `Total = SubTotal + ShippingCost - Discount` formula.

**Tech Stack:** .NET 9, CQRS via MediatR, FluentValidation, EF Core (Npgsql/PostgreSQL), `Result`/`Result<T>` pattern. Frontend: Next.js 15, next-intl, `apiFetch`, Phosphor icons, sonner toasts.

---

## Important workflow notes (this codebase)

- **No .sln.** Build with: `dotnet build src/Moveli.API/Moveli.API.csproj`
- **Stop the running API before building** (DLL file lock): `Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force`
- **No test framework exists.** Verification = `dotnet build` (0 errors) + `npx tsc --noEmit` (0 errors) + live-API curl checks. Do NOT invent a unit-test harness.
- **Repo is NOT git-initialized.** Skip all `git add` / `git commit` steps.
- Migrations are auto-applied on startup.
- EF entity configs are auto-discovered via `builder.ApplyConfigurationsFromAssembly(...)` — no manual registration needed.
- Repositories/services are registered in `ServiceCollectionExtensions.AddMoveliApplicationServices`.
- Admin test login: `admin@moveli.ge` / `Admin123!`. Login response field is **`accessToken`** (not `token`). API runs on `http://localhost:5026`.

---

## Task 1: Domain — enum + entities

**Files:**
- Create: `src/Moveli.Domain/Enums/PromoDiscountType.cs`
- Create: `src/Moveli.Domain/Entities/PromoCode.cs`
- Create: `src/Moveli.Domain/Entities/PromoCodeRedemption.cs`

- [ ] **Step 1: Create the discount-type enum**

`src/Moveli.Domain/Enums/PromoDiscountType.cs`:

```csharp
namespace Moveli.Domain.Enums;

public enum PromoDiscountType
{
    Percentage = 0,
    FixedAmount = 1
}
```

- [ ] **Step 2: Create the PromoCode entity**

`src/Moveli.Domain/Entities/PromoCode.cs`:

```csharp
using Moveli.Domain.Enums;

namespace Moveli.Domain.Entities;

public class PromoCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public PromoDiscountType Type { get; set; }
    public decimal Value { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }

    public bool IsLive(DateTime now) =>
        IsActive
        && (StartsAt == null || now >= StartsAt)
        && (EndsAt == null || now <= EndsAt);

    public decimal ComputeDiscount(decimal subtotal)
    {
        var discount = Type == PromoDiscountType.Percentage
            ? Math.Round(subtotal * Value / 100m, 2)
            : Value;
        return Math.Min(discount, subtotal);
    }
}
```

- [ ] **Step 3: Create the PromoCodeRedemption entity**

`src/Moveli.Domain/Entities/PromoCodeRedemption.cs`:

```csharp
namespace Moveli.Domain.Entities;

public class PromoCodeRedemption : BaseEntity
{
    public Guid PromoCodeId { get; set; }
    public Guid UserId { get; set; }
    public Guid OrderId { get; set; }
}
```

- [ ] **Step 4: Verify build**

Run: `Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force; dotnet build src/Moveli.API/Moveli.API.csproj`
Expected: Build succeeded, 0 errors.

---

## Task 2: Persistence — configs, DbSets, Order column, repository

**Files:**
- Create: `src/Moveli.API/Infrastructure/Data/Configurations/PromoCodeConfiguration.cs`
- Create: `src/Moveli.API/Infrastructure/Data/Configurations/PromoCodeRedemptionConfiguration.cs`
- Modify: `src/Moveli.API/Infrastructure/Data/MoveliDbContext.cs`
- Modify: `src/Moveli.Domain/Entities/Order.cs`
- Modify: `src/Moveli.API/Infrastructure/Data/Configurations/OrderConfiguration.cs`
- Create: `src/Moveli.Domain/Interfaces/IPromoCodeRepository.cs`
- Create: `src/Moveli.API/Infrastructure/Repositories/PromoCodeRepository.cs`
- Modify: `src/Moveli.API/Infrastructure/ServiceCollectionExtensions.cs`

- [ ] **Step 1: Create PromoCodeConfiguration**

`src/Moveli.API/Infrastructure/Data/Configurations/PromoCodeConfiguration.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class PromoCodeConfiguration : IEntityTypeConfiguration<PromoCode>
{
    public void Configure(EntityTypeBuilder<PromoCode> builder)
    {
        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(p => p.Code).IsUnique();
        builder.Property(p => p.Value).HasPrecision(18, 2);
        builder.Property(p => p.Type).HasConversion<int>();
    }
}
```

- [ ] **Step 2: Create PromoCodeRedemptionConfiguration**

`src/Moveli.API/Infrastructure/Data/Configurations/PromoCodeRedemptionConfiguration.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Moveli.Domain.Entities;

namespace Moveli.API.Infrastructure.Data.Configurations;

public class PromoCodeRedemptionConfiguration : IEntityTypeConfiguration<PromoCodeRedemption>
{
    public void Configure(EntityTypeBuilder<PromoCodeRedemption> builder)
    {
        builder.HasIndex(r => new { r.PromoCodeId, r.UserId }).IsUnique();
    }
}
```

- [ ] **Step 3: Add DbSets to MoveliDbContext**

In `src/Moveli.API/Infrastructure/Data/MoveliDbContext.cs`, alongside the other `DbSet` properties (which use the `=> Set<X>()` form), add:

```csharp
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<PromoCodeRedemption> PromoCodeRedemptions => Set<PromoCodeRedemption>();
```

Ensure `using Moveli.Domain.Entities;` is present (it already is for the other entities).

- [ ] **Step 4: Add PromoCode column to Order**

In `src/Moveli.Domain/Entities/Order.cs`, add a property next to `Notes`:

```csharp
    public string? PromoCode { get; set; }
```

- [ ] **Step 5: Configure the Order.PromoCode column**

In `src/Moveli.API/Infrastructure/Data/Configurations/OrderConfiguration.cs`, add near the `Notes` property config:

```csharp
        builder.Property(o => o.PromoCode).HasMaxLength(50);
```

- [ ] **Step 6: Create IPromoCodeRepository**

`src/Moveli.Domain/Interfaces/IPromoCodeRepository.cs`:

```csharp
using Moveli.Domain.Entities;

namespace Moveli.Domain.Interfaces;

public interface IPromoCodeRepository
{
    Task<List<PromoCode>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PromoCode?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PromoCode?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task AddAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task UpdateAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task DeleteAsync(PromoCode promoCode, CancellationToken cancellationToken = default);
    Task<bool> HasUserRedeemedAsync(Guid promoCodeId, Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetRedemptionCountAsync(Guid promoCodeId, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 7: Create PromoCodeRepository**

`src/Moveli.API/Infrastructure/Repositories/PromoCodeRepository.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Moveli.API.Infrastructure.Data;
using Moveli.Domain.Entities;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.Repositories;

public class PromoCodeRepository : IPromoCodeRepository
{
    private readonly MoveliDbContext _context;

    public PromoCodeRepository(MoveliDbContext context)
    {
        _context = context;
    }

    public async Task<List<PromoCode>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.PromoCodes
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<PromoCode?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _context.PromoCodes.FindAsync([id], cancellationToken);

    public async Task<PromoCode?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = code.Trim().ToUpperInvariant();
        return await _context.PromoCodes
            .FirstOrDefaultAsync(p => p.Code == normalized, cancellationToken);
    }

    public async Task AddAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        await _context.PromoCodes.AddAsync(promoCode, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        _context.PromoCodes.Update(promoCode);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(PromoCode promoCode, CancellationToken cancellationToken = default)
    {
        _context.PromoCodes.Remove(promoCode);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> HasUserRedeemedAsync(Guid promoCodeId, Guid userId, CancellationToken cancellationToken = default) =>
        await _context.PromoCodeRedemptions
            .AnyAsync(r => r.PromoCodeId == promoCodeId && r.UserId == userId, cancellationToken);

    public async Task<int> GetRedemptionCountAsync(Guid promoCodeId, CancellationToken cancellationToken = default) =>
        await _context.PromoCodeRedemptions
            .CountAsync(r => r.PromoCodeId == promoCodeId, cancellationToken);
}
```

- [ ] **Step 8: Register the repository in DI**

In `src/Moveli.API/Infrastructure/ServiceCollectionExtensions.cs`, alongside the other `services.AddScoped<IXRepository, XRepository>();` registrations, add:

```csharp
        services.AddScoped<IPromoCodeRepository, PromoCodeRepository>();
```

- [ ] **Step 9: Verify build**

Run: `Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force; dotnet build src/Moveli.API/Moveli.API.csproj`
Expected: Build succeeded, 0 errors.

---

## Task 3: EF migration

**Files:**
- Create: migration files under `src/Moveli.API/Migrations/` (generated)

- [ ] **Step 1: Add the migration**

Run (ensure API not running first):
`Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force; dotnet ef migrations add AddPromoCodes --project src/Moveli.API/Moveli.API.csproj`
Expected: Creates `*_AddPromoCodes.cs` adding `PromoCodes` + `PromoCodeRedemptions` tables and the `Orders.PromoCode` column.

> If `dotnet ef` is not installed: `dotnet tool install --global dotnet-ef` (or use the project's existing migration command pattern).

- [ ] **Step 2: Verify the migration content**

Open the generated migration and confirm: `PromoCodes` table (with unique index on `Code`), `PromoCodeRedemptions` table (with unique index on `(PromoCodeId, UserId)`), and an `AddColumn` for `PromoCode` on `Orders`. No unexpected drops.

- [ ] **Step 3: Apply by running the API**

Run: `dotnet run --project src/Moveli.API/Moveli.API.csproj` (migration auto-applies on startup). Confirm startup logs show the migration applied with no errors, then stop it.

---

## Task 4: Validation service + customer validate endpoint

**Files:**
- Create: `src/Moveli.Application/PromoCodes/PromoValidationResult.cs`
- Create: `src/Moveli.Application/PromoCodes/IPromoCodeService.cs`
- Create: `src/Moveli.API/Infrastructure/PromoCodes/PromoCodeService.cs`
- Create: `src/Moveli.Application/PromoCodes/Dtos/ValidatePromoResult.cs`
- Create: `src/Moveli.Application/PromoCodes/Queries/ValidatePromoCodeQuery.cs`
- Create: `src/Moveli.API/Controllers/PromoCodesController.cs`
- Modify: `src/Moveli.API/Infrastructure/ServiceCollectionExtensions.cs`

- [ ] **Step 1: Create the internal validation result**

`src/Moveli.Application/PromoCodes/PromoValidationResult.cs`:

```csharp
namespace Moveli.Application.PromoCodes;

public record PromoValidationResult(Guid PromoCodeId, string Code, decimal DiscountAmount);
```

- [ ] **Step 2: Create the service interface**

`src/Moveli.Application/PromoCodes/IPromoCodeService.cs`:

```csharp
using Moveli.Application.Common;

namespace Moveli.Application.PromoCodes;

public interface IPromoCodeService
{
    Task<Result<PromoValidationResult>> ValidateAsync(
        string code, decimal subtotal, Guid userId, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 3: Implement the service**

`src/Moveli.API/Infrastructure/PromoCodes/PromoCodeService.cs`:

```csharp
using Moveli.Application.Common;
using Moveli.Application.PromoCodes;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Infrastructure.PromoCodes;

public class PromoCodeService : IPromoCodeService
{
    private readonly IPromoCodeRepository _repository;

    public PromoCodeService(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PromoValidationResult>> ValidateAsync(
        string code, decimal subtotal, Guid userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<PromoValidationResult>.Failure("Promo code is invalid.");

        var promo = await _repository.GetByCodeAsync(code, cancellationToken);
        if (promo == null)
            return Result<PromoValidationResult>.Failure("Promo code is invalid.");

        if (!promo.IsLive(DateTime.UtcNow))
            return Result<PromoValidationResult>.Failure("This promo code is expired or inactive.");

        if (await _repository.HasUserRedeemedAsync(promo.Id, userId, cancellationToken))
            return Result<PromoValidationResult>.Failure("You have already used this promo code.");

        var discount = promo.ComputeDiscount(subtotal);
        return Result<PromoValidationResult>.Success(
            new PromoValidationResult(promo.Id, promo.Code, discount));
    }
}
```

- [ ] **Step 4: Create the customer-facing result DTO**

`src/Moveli.Application/PromoCodes/Dtos/ValidatePromoResult.cs`:

```csharp
namespace Moveli.Application.PromoCodes.Dtos;

public record ValidatePromoResult(string Code, decimal DiscountAmount);
```

- [ ] **Step 5: Create the ValidatePromoCodeQuery + handler**

`src/Moveli.Application/PromoCodes/Queries/ValidatePromoCodeQuery.cs`:

```csharp
using MediatR;
using Moveli.Application.Common;
using Moveli.Application.PromoCodes.Dtos;

namespace Moveli.Application.PromoCodes.Queries;

public record ValidatePromoCodeQuery(string Code, decimal Subtotal, Guid UserId)
    : IRequest<Result<ValidatePromoResult>>;

public class ValidatePromoCodeQueryHandler
    : IRequestHandler<ValidatePromoCodeQuery, Result<ValidatePromoResult>>
{
    private readonly IPromoCodeService _service;

    public ValidatePromoCodeQueryHandler(IPromoCodeService service)
    {
        _service = service;
    }

    public async Task<Result<ValidatePromoResult>> Handle(
        ValidatePromoCodeQuery request, CancellationToken cancellationToken)
    {
        var result = await _service.ValidateAsync(
            request.Code, request.Subtotal, request.UserId, cancellationToken);

        if (!result.IsSuccess)
            return Result<ValidatePromoResult>.Failure(result.Error!);

        return Result<ValidatePromoResult>.Success(
            new ValidatePromoResult(result.Value!.Code, result.Value.DiscountAmount));
    }
}
```

> Note: `IPromoCodeService` lives in `Moveli.Application.PromoCodes` — same assembly, so add `using Moveli.Application.PromoCodes;` if the handler file's namespace doesn't already cover it. (The query file is in `Moveli.Application.PromoCodes.Queries`, so add the using.)

- [ ] **Step 6: Create the controller**

`src/Moveli.API/Controllers/PromoCodesController.cs`:

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Common;
using Moveli.Application.PromoCodes.Queries;

namespace Moveli.API.Controllers;

[ApiController]
[Route("api/promo-codes")]
[Authorize]
public class PromoCodesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public PromoCodesController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    public record ValidatePromoRequest(string Code, decimal Subtotal);

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidatePromoRequest request)
    {
        var result = await _mediator.Send(
            new ValidatePromoCodeQuery(request.Code, request.Subtotal, _currentUser.UserId!.Value));

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}
```

> Confirm `ICurrentUser` lives in `Moveli.Application.Common` (it does, per established controllers). Match the exact `using` used by `OrdersController`.

- [ ] **Step 7: Register the service in DI**

In `src/Moveli.API/Infrastructure/ServiceCollectionExtensions.cs`, near the other service registrations (e.g. `IDiscountService`), add:

```csharp
        services.AddScoped<IPromoCodeService, PromoCodeService>();
```

Add `using Moveli.Application.PromoCodes;` and `using Moveli.API.Infrastructure.PromoCodes;` if not present.

- [ ] **Step 8: Verify build**

Run: `Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force; dotnet build src/Moveli.API/Moveli.API.csproj`
Expected: Build succeeded, 0 errors.

---

## Task 5: Order integration (authoritative re-validation)

**Files:**
- Modify: `src/Moveli.Application/Orders/Commands/CreateOrderCommand.cs`
- Modify: `src/Moveli.API/Infrastructure/Orders/CreateOrderCommandHandler.cs`
- Modify: `src/Moveli.API/Controllers/OrdersController.cs`
- Modify: `src/Moveli.Application/Orders/Dtos/OrderDto.cs` (OrderDto + CreateOrderRequest)
- Modify: order→DTO mappers (in `CreateOrderCommandHandler` and `GetOrderDetailQuery`)

- [ ] **Step 1: Add PromoCode to CreateOrderCommand**

In `src/Moveli.Application/Orders/Commands/CreateOrderCommand.cs`, add `string? PromoCode` to the command record's parameter list (append at the end so positional callers elsewhere stay valid — but since callers use the controller below, named is fine):

```csharp
public record CreateOrderCommand(
    Guid UserId,
    string ShippingFullName,
    string ShippingPhoneNumber,
    string ShippingCity,
    string ShippingStreet,
    string? ShippingPostalCode,
    PaymentMethod PaymentMethod,
    string? Notes,
    string? PromoCode) : IRequest<Result<OrderDto>>;
```

- [ ] **Step 2: Add PromoCode to CreateOrderRequest + OrderDto**

In `src/Moveli.Application/Orders/Dtos/OrderDto.cs`:
- Add `string? PromoCode` to the `OrderDto` record (after `Discount`).
- Add `string? PromoCode` to the `CreateOrderRequest` record (after `Notes`).

- [ ] **Step 3: Pass PromoCode from the controller**

In `src/Moveli.API/Controllers/OrdersController.cs`, in the `Create` action where it builds `new CreateOrderCommand(...)`, add `request.PromoCode` as the final argument (matching the new parameter order).

- [ ] **Step 4: Inject the promo service into the handler**

In `src/Moveli.API/Infrastructure/Orders/CreateOrderCommandHandler.cs`:
- Add field `private readonly IPromoCodeService _promoCodeService;` and a constructor parameter, assigning it.
- Add `using Moveli.Application.PromoCodes;`.

- [ ] **Step 5: Apply the promo inside the transaction**

In `CreateOrderCommandHandler.Handle`, after `order.SubTotal` and `order.ShippingCost` are computed but before/where `order.Discount` is set, replace the `order.Discount = 0;` line with:

```csharp
        order.Discount = 0m;
        PromoValidationResult? promo = null;
        if (!string.IsNullOrWhiteSpace(request.PromoCode))
        {
            var promoResult = await _promoCodeService.ValidateAsync(
                request.PromoCode, order.SubTotal, request.UserId, cancellationToken);
            if (!promoResult.IsSuccess)
                return Result<OrderDto>.Failure(promoResult.Error!);

            promo = promoResult.Value;
            order.Discount = promo!.DiscountAmount;
            order.PromoCode = promo.Code;
        }

        order.Total = order.SubTotal + order.ShippingCost - order.Discount;
```

(Remove the pre-existing `order.Total = ...` line if it duplicates; keep a single assignment using the formula above.)

- [ ] **Step 6: Write the redemption row after the order is saved**

In the same handler, after the order has been added/saved and has a valid `order.Id` (still inside the transaction, before commit), add:

```csharp
        if (promo != null)
        {
            _context.PromoCodeRedemptions.Add(new PromoCodeRedemption
            {
                PromoCodeId = promo.PromoCodeId,
                UserId = request.UserId,
                OrderId = order.Id
            });
            await _context.SaveChangesAsync(cancellationToken);
        }
```

Add `using Moveli.Domain.Entities;` if not present.

> If the handler saves the order via a repository rather than `_context`, ensure `order.Id` is populated (BaseEntity sets it in the constructor, so it is) and that the redemption add happens on the same `_context`/transaction. Match the existing transaction/commit structure exactly.

- [ ] **Step 7: Map PromoCode in both order→DTO mappers**

- In `CreateOrderCommandHandler` where it builds the returned `OrderDto`, add `order.PromoCode` (in the `PromoCode` slot).
- In `src/Moveli.Application/Orders/Queries/GetOrderDetailQuery.cs` (and any list mapper that builds `OrderDto`), add `o.PromoCode` to the projection.

- [ ] **Step 8: Verify build**

Run: `Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force; dotnet build src/Moveli.API/Moveli.API.csproj`
Expected: Build succeeded, 0 errors. Fix any callers of `CreateOrderCommand`/`OrderDto` that now need the extra argument.

---

## Task 6: Admin CRUD

**Files:**
- Create: `src/Moveli.Application/PromoCodes/Dtos/PromoCodeDto.cs`
- Create: `src/Moveli.Application/PromoCodes/Commands/CreatePromoCodeCommand.cs`
- Create: `src/Moveli.Application/PromoCodes/Commands/UpdatePromoCodeCommand.cs`
- Create: `src/Moveli.Application/PromoCodes/Commands/DeletePromoCodeCommand.cs`
- Create: `src/Moveli.Application/PromoCodes/Queries/GetPromoCodesQuery.cs`
- Create: `src/Moveli.API/Controllers/Admin/AdminPromoCodesController.cs`

- [ ] **Step 1: Create PromoCodeDto**

`src/Moveli.Application/PromoCodes/Dtos/PromoCodeDto.cs`:

```csharp
using Moveli.Domain.Enums;

namespace Moveli.Application.PromoCodes.Dtos;

public record PromoCodeDto(
    Guid Id,
    string Code,
    PromoDiscountType Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt,
    int RedemptionCount);
```

- [ ] **Step 2: Create CreatePromoCodeCommand (+ validator + handler)**

`src/Moveli.Application/PromoCodes/Commands/CreatePromoCodeCommand.cs`:

```csharp
using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Entities;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Commands;

public record CreatePromoCodeCommand(
    string Code,
    string Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt) : IRequest<Result<Guid>>;

public class CreatePromoCodeCommandValidator : AbstractValidator<CreatePromoCodeCommand>
{
    public CreatePromoCodeCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Type)
            .Must(t => Enum.TryParse<PromoDiscountType>(t, true, out _))
            .WithMessage("Type must be Percentage or FixedAmount.");
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.Value)
            .LessThanOrEqualTo(100)
            .When(x => Enum.TryParse<PromoDiscountType>(x.Type, true, out var t) && t == PromoDiscountType.Percentage)
            .WithMessage("Percentage value must be between 0 and 100.");
        RuleFor(x => x.EndsAt)
            .GreaterThanOrEqualTo(x => x.StartsAt)
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue)
            .WithMessage("End date must be on or after start date.");
    }
}

public class CreatePromoCodeCommandHandler : IRequestHandler<CreatePromoCodeCommand, Result<Guid>>
{
    private readonly IPromoCodeRepository _repository;

    public CreatePromoCodeCommandHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreatePromoCodeCommand request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();

        var existing = await _repository.GetByCodeAsync(code, cancellationToken);
        if (existing != null)
            return Result<Guid>.Failure("A promo code with this code already exists.");

        var promo = new PromoCode
        {
            Code = code,
            Type = Enum.Parse<PromoDiscountType>(request.Type, true),
            Value = request.Value,
            IsActive = request.IsActive,
            StartsAt = request.StartsAt?.ToUniversalTime(),
            EndsAt = request.EndsAt?.ToUniversalTime()
        };

        await _repository.AddAsync(promo, cancellationToken);
        return Result<Guid>.Success(promo.Id);
    }
}
```

- [ ] **Step 3: Create UpdatePromoCodeCommand (+ validator + handler)**

`src/Moveli.Application/PromoCodes/Commands/UpdatePromoCodeCommand.cs`:

```csharp
using FluentValidation;
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Enums;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Commands;

public record UpdatePromoCodeCommand(
    Guid Id,
    string Code,
    string Type,
    decimal Value,
    bool IsActive,
    DateTime? StartsAt,
    DateTime? EndsAt) : IRequest<Result>;

public class UpdatePromoCodeCommandValidator : AbstractValidator<UpdatePromoCodeCommand>
{
    public UpdatePromoCodeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Type)
            .Must(t => Enum.TryParse<PromoDiscountType>(t, true, out _))
            .WithMessage("Type must be Percentage or FixedAmount.");
        RuleFor(x => x.Value).GreaterThan(0);
        RuleFor(x => x.Value)
            .LessThanOrEqualTo(100)
            .When(x => Enum.TryParse<PromoDiscountType>(x.Type, true, out var t) && t == PromoDiscountType.Percentage)
            .WithMessage("Percentage value must be between 0 and 100.");
        RuleFor(x => x.EndsAt)
            .GreaterThanOrEqualTo(x => x.StartsAt)
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue)
            .WithMessage("End date must be on or after start date.");
    }
}

public class UpdatePromoCodeCommandHandler : IRequestHandler<UpdatePromoCodeCommand, Result>
{
    private readonly IPromoCodeRepository _repository;

    public UpdatePromoCodeCommandHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(UpdatePromoCodeCommand request, CancellationToken cancellationToken)
    {
        var promo = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (promo == null)
            return Result.Failure("Promo code not found.");

        var code = request.Code.Trim().ToUpperInvariant();
        var existing = await _repository.GetByCodeAsync(code, cancellationToken);
        if (existing != null && existing.Id != promo.Id)
            return Result.Failure("A promo code with this code already exists.");

        promo.Code = code;
        promo.Type = Enum.Parse<PromoDiscountType>(request.Type, true);
        promo.Value = request.Value;
        promo.IsActive = request.IsActive;
        promo.StartsAt = request.StartsAt?.ToUniversalTime();
        promo.EndsAt = request.EndsAt?.ToUniversalTime();

        await _repository.UpdateAsync(promo, cancellationToken);
        return Result.Success();
    }
}
```

- [ ] **Step 4: Create DeletePromoCodeCommand (+ handler)**

`src/Moveli.Application/PromoCodes/Commands/DeletePromoCodeCommand.cs`:

```csharp
using MediatR;
using Moveli.Application.Common;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Commands;

public record DeletePromoCodeCommand(Guid Id) : IRequest<Result>;

public class DeletePromoCodeCommandHandler : IRequestHandler<DeletePromoCodeCommand, Result>
{
    private readonly IPromoCodeRepository _repository;

    public DeletePromoCodeCommandHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeletePromoCodeCommand request, CancellationToken cancellationToken)
    {
        var promo = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (promo == null)
            return Result.Failure("Promo code not found.");

        await _repository.DeleteAsync(promo, cancellationToken);
        return Result.Success();
    }
}
```

- [ ] **Step 5: Create GetPromoCodesQuery (+ handler)**

`src/Moveli.Application/PromoCodes/Queries/GetPromoCodesQuery.cs`:

```csharp
using MediatR;
using Moveli.Application.Common;
using Moveli.Application.PromoCodes.Dtos;
using Moveli.Domain.Interfaces;

namespace Moveli.Application.PromoCodes.Queries;

public record GetPromoCodesQuery() : IRequest<Result<List<PromoCodeDto>>>;

public class GetPromoCodesQueryHandler : IRequestHandler<GetPromoCodesQuery, Result<List<PromoCodeDto>>>
{
    private readonly IPromoCodeRepository _repository;

    public GetPromoCodesQueryHandler(IPromoCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<PromoCodeDto>>> Handle(GetPromoCodesQuery request, CancellationToken cancellationToken)
    {
        var promos = await _repository.GetAllAsync(cancellationToken);
        var dtos = new List<PromoCodeDto>();
        foreach (var p in promos)
        {
            var count = await _repository.GetRedemptionCountAsync(p.Id, cancellationToken);
            dtos.Add(new PromoCodeDto(p.Id, p.Code, p.Type, p.Value, p.IsActive, p.StartsAt, p.EndsAt, count));
        }
        return Result<List<PromoCodeDto>>.Success(dtos);
    }
}
```

- [ ] **Step 6: Create the admin controller**

`src/Moveli.API/Controllers/Admin/AdminPromoCodesController.cs` (mirror `AdminDiscountsController` exactly — namespace, base route style, response shapes):

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.PromoCodes.Commands;
using Moveli.Application.PromoCodes.Queries;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/promo-codes")]
[Authorize(Roles = "Admin")]
public class AdminPromoCodesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminPromoCodesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetPromoCodesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePromoCodeCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(new { id = result.Value }) : BadRequest(new { error = result.Error });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePromoCodeCommand command)
    {
        if (id != command.Id) return BadRequest(new { error = "Id mismatch." });
        var result = await _mediator.Send(command);
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeletePromoCodeCommand(id));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }
}
```

> Verify against `AdminDiscountsController`: match its exact response patterns (e.g. whether Update returns `NoContent()` or `Ok(...)`) and adjust if the existing one differs.

- [ ] **Step 7: Verify build**

Run: `Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force; dotnet build src/Moveli.API/Moveli.API.csproj`
Expected: Build succeeded, 0 errors.

---

## Task 7: Frontend — types + API clients

**Files:**
- Modify: `frontend/src/lib/api/types.ts`
- Create: `frontend/src/lib/api/promo-codes.ts`
- Modify: `frontend/src/lib/api/admin.ts`

- [ ] **Step 1: Add types**

In `frontend/src/lib/api/types.ts`:

```ts
export type PromoDiscountType = 0 | 1; // 0 = Percentage, 1 = FixedAmount

export interface PromoCodeDto {
  id: string;
  code: string;
  type: PromoDiscountType;
  value: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  redemptionCount: number;
}

export interface ValidatePromoResult {
  code: string;
  discountAmount: number;
}

export interface CreatePromoCodeRequest {
  code: string;
  type: string; // "Percentage" | "FixedAmount"
  value: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface UpdatePromoCodeRequest extends CreatePromoCodeRequest {
  id: string;
}
```

Also: add `promoCode: string | null;` to the existing `OrderDto` interface, and `promoCode?: string;` to the existing `CreateOrderRequest` interface.

> Note on enum serialization: the backend returns the enum as an int via System.Text.Json default, so `type` is `0 | 1`. The create/update requests send the enum as a **string** ("Percentage"/"FixedAmount") because the command uses `string Type` parsed via `Enum.TryParse`. Keep these distinct.

- [ ] **Step 2: Create promo-codes API**

`frontend/src/lib/api/promo-codes.ts`:

```ts
import { apiFetch } from "./client";
import type { ValidatePromoResult } from "./types";

export function validatePromoCode(data: { code: string; subtotal: number }) {
  return apiFetch<ValidatePromoResult>("/api/promo-codes/validate", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}
```

> Confirm `apiFetch`'s body convention (object vs pre-stringified) by reading `client.ts`; match exactly what `orders.ts` does.

- [ ] **Step 3: Add admin CRUD functions**

In `frontend/src/lib/api/admin.ts`, following the existing discount/brand functions:

```ts
import type {
  PromoCodeDto,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
} from "./types";

export function getPromoCodes() {
  return apiFetch<PromoCodeDto[]>("/api/admin/promo-codes", { requireAuth: true });
}

export function createPromoCode(data: CreatePromoCodeRequest) {
  return apiFetch<{ id: string }>("/api/admin/promo-codes", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function updatePromoCode(id: string, data: UpdatePromoCodeRequest) {
  return apiFetch<void>(`/api/admin/promo-codes/${id}`, {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

export function deletePromoCode(id: string) {
  return apiFetch<void>(`/api/admin/promo-codes/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}
```

> Match the existing import style in `admin.ts` (it may already import from `./types` — extend that import rather than adding a duplicate). Match how existing admin functions pass auth/body.

- [ ] **Step 4: Verify types compile**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors.

---

## Task 8: Frontend — checkout promo UI

**Files:**
- Modify: `frontend/src/components/checkout/checkout-content.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/ka.json`

- [ ] **Step 1: Read the current checkout component**

Read `frontend/src/components/checkout/checkout-content.tsx` fully to locate: the subtotal/shipping/total computation, the Order summary card JSX, the `handlePlaceOrder` → `createOrder` call, and existing imports/state hooks.

- [ ] **Step 2: Add imports + state**

Add imports:
```ts
import { validatePromoCode } from "@/lib/api/promo-codes";
import { Tag, X } from "@phosphor-icons/react";
```
Add state near the other `useState` hooks:
```ts
const [promoInput, setPromoInput] = useState("");
const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
const [promoLoading, setPromoLoading] = useState(false);
```

- [ ] **Step 3: Add apply/remove handlers**

```ts
const handleApplyPromo = async () => {
  if (!promoInput.trim()) return;
  setPromoLoading(true);
  try {
    const result = await validatePromoCode({ code: promoInput.trim(), subtotal });
    setAppliedPromo({ code: result.code, discountAmount: result.discountAmount });
    toast.success(t("promoApplied", { code: result.code }));
  } catch (err) {
    const message = err instanceof Error ? err.message : t("promoInvalid");
    toast.error(message);
    setAppliedPromo(null);
  } finally {
    setPromoLoading(false);
  }
};

const handleRemovePromo = () => {
  setAppliedPromo(null);
  setPromoInput("");
};
```

> Use the same `subtotal` variable the summary already uses. Confirm `toast` and `t` are already in scope (the component already uses `useTranslations` and `sonner`).

- [ ] **Step 4: Recompute total with discount**

Find where the total is computed and incorporate the discount:
```ts
const discount = appliedPromo?.discountAmount ?? 0;
const total = subtotal + shipping - discount;
```
(Match the existing variable names for `shipping`/`subtotal`; if total was previously `subtotal + shipping`, just subtract `discount`.)

- [ ] **Step 5: Add the promo UI to the Order summary card**

Inside the Order summary, above the total line:
```tsx
{appliedPromo ? (
  <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
    <span className="flex items-center gap-1">
      <Tag size={16} weight="fill" />
      {t("promoChip", { code: appliedPromo.code, amount: appliedPromo.discountAmount })}
    </span>
    <button type="button" onClick={handleRemovePromo} aria-label={t("promoRemove")}>
      <X size={16} />
    </button>
  </div>
) : (
  <div className="flex gap-2">
    <input
      type="text"
      value={promoInput}
      onChange={(e) => setPromoInput(e.target.value)}
      placeholder={t("promoPlaceholder")}
      className="flex-1 rounded-lg border px-3 py-2 text-sm"
    />
    <button
      type="button"
      onClick={handleApplyPromo}
      disabled={promoLoading || !promoInput.trim()}
      className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {t("promoApply")}
    </button>
  </div>
)}
{appliedPromo && (
  <div className="flex items-center justify-between text-sm">
    <span>{t("promoDiscountLine", { code: appliedPromo.code })}</span>
    <span>−₾{appliedPromo.discountAmount.toFixed(2)}</span>
  </div>
)}
```

> Match the existing summary's class names/markup style. This is illustrative — adapt class names to the component's existing Tailwind conventions.

- [ ] **Step 6: Pass promoCode to createOrder**

In `handlePlaceOrder`, add `promoCode: appliedPromo?.code` to the `createOrder({...})` payload object.

- [ ] **Step 7: Add translation keys**

In `frontend/messages/en.json` under the checkout namespace used by this component:
```json
"promoPlaceholder": "Promo code",
"promoApply": "Apply",
"promoApplied": "{code} applied",
"promoChip": "{code} applied · −₾{amount}",
"promoDiscountLine": "Discount ({code})",
"promoRemove": "Remove promo code",
"promoInvalid": "This promo code is invalid."
```
In `frontend/messages/ka.json` under the same namespace:
```json
"promoPlaceholder": "პრომო კოდი",
"promoApply": "გამოყენება",
"promoApplied": "{code} გააქტიურდა",
"promoChip": "{code} გააქტიურდა · −₾{amount}",
"promoDiscountLine": "ფასდაკლება ({code})",
"promoRemove": "პრომო კოდის წაშლა",
"promoInvalid": "ეს პრომო კოდი არასწორია."
```

> Confirm the exact checkout namespace key (e.g. `Checkout`) by reading the existing keys in en.json. Place the new keys inside that object.

- [ ] **Step 8: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors.

---

## Task 9: Frontend — admin promo-codes page + nav + i18n

**Files:**
- Create: `frontend/src/app/[locale]/admin/promo-codes/page.tsx`
- Modify: `frontend/src/components/admin/admin-sidebar.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/ka.json`

- [ ] **Step 1: Read the model page**

Read `frontend/src/app/[locale]/admin/discounts/page.tsx` fully — the new page mirrors its structure (list + inline create/edit form, loading/toast patterns, form state).

- [ ] **Step 2: Create the admin page**

Create `frontend/src/app/[locale]/admin/promo-codes/page.tsx` modeled on the discounts page. Requirements:
- Fetch list via `getPromoCodes()` on mount.
- Form fields: `code` (text), `type` selector (Percentage / FixedAmount), `value` (number), `isActive` (toggle/checkbox), optional `startsAt` / `endsAt` (date inputs → ISO strings or null).
- Submit: `createPromoCode(payload)` for new, `updatePromoCode(id, { ...payload, id })` for edit. `type` sent as the string "Percentage"/"FixedAmount".
- List rows show: code, `type+value` (e.g. "15%" or "₾80"), status badge (Active / Scheduled (future StartsAt) / Expired (past EndsAt) / Off (!isActive)), date window, `redemptionCount`, edit + delete buttons.
- Delete via `deletePromoCode(id)` with confirm, then refresh.
- Use `useTranslations("admin")` for labels; toasts via `sonner`.

> Keep the exact import paths, layout wrapper, and styling conventions used by the discounts page. Convert date inputs to ISO (e.g. `new Date(value).toISOString()`); send `null` when empty.

- [ ] **Step 3: Add the sidebar nav item**

In `frontend/src/components/admin/admin-sidebar.tsx`:
- Import `Ticket` from `@phosphor-icons/react` (extend the existing icon import).
- Add to the navItems array (near the discounts item):
```ts
{ href: "/admin/promo-codes", icon: Ticket, labelKey: "promoCodes" as const },
```

- [ ] **Step 4: Add admin i18n keys**

In `frontend/messages/en.json` under `admin`:
```json
"promoCodes": "Promo Codes",
"promoCodeCode": "Code",
"promoCodeType": "Type",
"promoCodeTypePercentage": "Percentage",
"promoCodeTypeFixed": "Fixed amount (₾)",
"promoCodeValue": "Value",
"promoCodeActive": "Active",
"promoCodeStartsAt": "Starts at",
"promoCodeEndsAt": "Ends at",
"promoCodeRedemptions": "Redemptions",
"promoCodeStatusActive": "Active",
"promoCodeStatusScheduled": "Scheduled",
"promoCodeStatusExpired": "Expired",
"promoCodeStatusOff": "Off",
"promoCodeCreate": "Create promo code",
"promoCodeEdit": "Edit promo code",
"promoCodeDeleteConfirm": "Delete this promo code?"
```
In `frontend/messages/ka.json` under `admin` (use sensible Georgian translations):
```json
"promoCodes": "პრომო კოდები",
"promoCodeCode": "კოდი",
"promoCodeType": "ტიპი",
"promoCodeTypePercentage": "პროცენტი",
"promoCodeTypeFixed": "ფიქსირებული თანხა (₾)",
"promoCodeValue": "მნიშვნელობა",
"promoCodeActive": "აქტიური",
"promoCodeStartsAt": "დაწყება",
"promoCodeEndsAt": "დასრულება",
"promoCodeRedemptions": "გამოყენებები",
"promoCodeStatusActive": "აქტიური",
"promoCodeStatusScheduled": "დაგეგმილი",
"promoCodeStatusExpired": "ვადაგასული",
"promoCodeStatusOff": "გათიშული",
"promoCodeCreate": "პრომო კოდის შექმნა",
"promoCodeEdit": "პრომო კოდის რედაქტირება",
"promoCodeDeleteConfirm": "წავშალოთ ეს პრომო კოდი?"
```

> Match the existing `admin` namespace key names already used by the discounts page where they overlap (e.g. generic "save"/"cancel"/"delete" likely already exist — reuse them rather than duplicating).

- [ ] **Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors.

---

## Task 10: End-to-end verification

- [ ] **Step 1: Build backend**

Run: `Get-Process -Name Moveli.API -ErrorAction SilentlyContinue | Stop-Process -Force; dotnet build src/Moveli.API/Moveli.API.csproj`
Expected: 0 errors.

- [ ] **Step 2: Build frontend types**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run the API (migration applies)**

Run: `dotnet run --project src/Moveli.API/Moveli.API.csproj` (background). Confirm `AddPromoCodes` migration applies cleanly on startup.

- [ ] **Step 4: Admin login + create codes**

Login: `POST http://localhost:5026/api/auth/login` with `admin@moveli.ge` / `Admin123!`; grab `accessToken`.
Create percentage code: `POST /api/admin/promo-codes` `{ "code": "SAVE15", "type": "Percentage", "value": 15, "isActive": true, "startsAt": null, "endsAt": null }` → 200 with id.
Create fixed code: `{ "code": "MOVELI80", "type": "FixedAmount", "value": 80, "isActive": true, ... }` → 200.
`GET /api/admin/promo-codes` → both listed, `redemptionCount: 0`.

- [ ] **Step 5: Validate at checkout (customer)**

As a customer token: `POST /api/promo-codes/validate` `{ "code": "save15", "subtotal": 200 }` → `{ code: "SAVE15", discountAmount: 30 }` (case-insensitive, 15% of 200).
`{ "code": "MOVELI80", "subtotal": 50 }` → `discountAmount: 50` (capped at subtotal).
`{ "code": "NOPE", "subtotal": 200 }` → 400 "invalid".

- [ ] **Step 6: Place order with promo**

`POST /api/orders` with `promoCode: "SAVE15"` (after adding items, subtotal ≥ ₾30). Order succeeds; fetch order detail → `discount` reflects 15% and `promoCode = "SAVE15"`; `total = subtotal + shipping − discount`. Confirm a `PromoCodeRedemptions` row exists.

- [ ] **Step 7: Once-per-customer enforcement**

Same customer re-validates/re-orders SAVE15 → rejected "already used".

- [ ] **Step 8: Window/active rules**

Create a code with `isActive: false` or `endsAt` in the past → validate → rejected "expired or inactive".

- [ ] **Step 9: Tamper test**

Send a bogus `promoCode` directly to `POST /api/orders` → order fails validation (server authoritative), no redemption written.

- [ ] **Step 10: UI smoke**

In the browser: admin `/admin/promo-codes` create/edit/delete works; checkout Apply shows the chip + discount line and updates total; remove (×) clears it.
