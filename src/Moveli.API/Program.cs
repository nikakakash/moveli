using System.Threading.RateLimiting;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Moveli.API.Extensions;
using Moveli.API.Infrastructure.Data;
using Moveli.API.Infrastructure.Health;
using Moveli.API.Infrastructure.Identity;
using Moveli.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Core services
builder.Services.AddMoveliDatabase(builder.Configuration);
builder.Services.AddMoveliIdentity();
builder.Services.AddMoveliAuthentication(builder.Configuration);
builder.Services.AddMoveliApplicationServices();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:3000"])
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 10;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });

    // Global limiter throttles every endpoint that doesn't opt into a stricter named
    // policy. Partitioned by client IP so one caller can't exhaust the budget for all.
    // Behind a proxy this relies on UseForwardedHeaders (configured below) for the real IP.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(clientIp, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
});

// In-process cache for read-mostly reference data (categories, brands, featured products).
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<Moveli.Application.Common.ICacheInvalidator, Moveli.API.Infrastructure.Caching.CacheInvalidator>();

// Distributed cache abstraction: Redis when configured (multi-instance), otherwise an
// in-process distributed-memory backend so DI consumers can depend on IDistributedCache
// today without code changes when you scale out later.
var redisConn = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrWhiteSpace(redisConn))
{
    builder.Services.AddStackExchangeRedisCache(o =>
    {
        o.Configuration = redisConn;
        // Per-deploy keyspace prefix prevents stale entries from a previous version from
        // poisoning a new deploy when Redis is shared across environments/instances.
        o.InstanceName = $"moveli:{builder.Environment.EnvironmentName}:";
    });
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// Persist DataProtection keys so antiforgery / auth payloads survive restarts and can be
// shared across instances when scaling out. Defaults to a folder under the content root;
// point DataProtection:KeysPath at a shared volume for multi-instance deployments.
var keysPath = builder.Configuration["DataProtection:KeysPath"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "keys");
Directory.CreateDirectory(keysPath);
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
    .SetApplicationName("Moveli");

// Forwarded headers so scheme + client IP are correct behind a proxy / load balancer.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Clear the default localhost-only restriction; the proxy network is trusted by deployment.
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Health checks for LB / orchestrator probes.
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database")
    .AddCheck<DistributedCacheHealthCheck>("cache", tags: new[] { "cache" });

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Replace ASP.NET's default model validation error response with our own user-friendly format
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .SelectMany(e => e.Value!.Errors.Select(err => err.ErrorMessage))
            .Where(msg => !string.IsNullOrEmpty(msg))
            .ToList();

        var message = errors.Count > 0
            ? string.Join(" ", errors)
            : "Invalid request. Please check your input and try again.";

        return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new { error = message });
    };
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "MOVELI API",
        Version = "v1",
        Description = "Georgian e-commerce platform API"
    });
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your JWT token"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<MoveliDbContext>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    await context.Database.MigrateAsync();
    await MoveliDbContextSeed.SeedAsync(context, userManager, roleManager);
}

// Must run before anything that reads scheme / client IP (rate limiter, HTTPS redirect).
app.UseForwardedHeaders();

// Security response headers on every response.
var isDev = app.Environment.IsDevelopment();
// Conservative CSP: the API serves JSON and a Swagger UI (dev only); never inline HTML to
// end users — the frontend is a separate Next.js origin. We allow self for everything,
// data: for Swagger asset URIs, and 'unsafe-inline' for Swagger UI script/style only in dev.
var csp = isDev
    ? "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    : "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests";
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["X-XSS-Protection"] = "0";
    headers["Content-Security-Policy"] = csp;
    headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()";
    await next();
});

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // HSTS only in production — avoids pinning HTTPS on localhost during development.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseRateLimiter();

// Serve uploaded files. Path is configurable so it can point at a shared volume when
// running multiple instances (local disk is not visible across instances otherwise).
var uploadsPath = builder.Configuration["Storage:UploadsPath"]
    ?? Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
