using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Identity;
using Moveli.API.Infrastructure.PromoCodes;
using Moveli.API.Infrastructure.Repositories;
using Moveli.API.Infrastructure.Services;
using Moveli.Application.Auth;
using Moveli.Application.Common;
using Moveli.Application.Common.Behaviors;
using Moveli.Application.Discounts;
using Moveli.Application.PromoCodes;
using Moveli.Domain.Interfaces;

namespace Moveli.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMoveliDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<MoveliDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        return services;
    }

    public static IServiceCollection AddMoveliIdentity(this IServiceCollection services)
    {
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
            options.User.RequireUniqueEmail = true;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
        })
        .AddEntityFrameworkStores<MoveliDbContext>()
        .AddDefaultTokenProviders();

        return services;
    }

    public static IServiceCollection AddMoveliAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]!))
            };
        });

        return services;
    }

    public static IServiceCollection AddMoveliApplicationServices(this IServiceCollection services)
    {
        // MediatR + Pipeline Behaviors (register from both Application and API assemblies)
        var applicationAssembly = typeof(Result).Assembly;
        var apiAssembly = typeof(ServiceCollectionExtensions).Assembly;
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssemblies(applicationAssembly, apiAssembly);
            cfg.AddBehavior(typeof(MediatR.IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            cfg.AddBehavior(typeof(MediatR.IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        // FluentValidation
        services.AddValidatorsFromAssembly(applicationAssembly);

        // HTTP Context + Current User
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUserService>();
        services.AddScoped<ITokenService, TokenService>();

        // Repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IWishlistRepository, WishlistRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IDiscountRepository, DiscountRepository>();
        services.AddScoped<IAddressRepository, AddressRepository>();
        services.AddScoped<ISettingsRepository, SettingsRepository>();
        services.AddScoped<IReportRepository, ReportRepository>();
        services.AddScoped<IPromoCodeRepository, PromoCodeRepository>();

        // Pricing / discounts
        services.AddScoped<IDiscountService, DiscountService>();

        // Promo codes
        services.AddScoped<IPromoCodeService, PromoCodeService>();

        return services;
    }
}
