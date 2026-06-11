using System.Net;
using System.Text.Json;
using FluentValidation;

namespace Moveli.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";

            // Single consistent error shape across the API: { error: "message" }.
            var message = string.Join(" ", ex.Errors.Select(e => e.ErrorMessage).Distinct());
            if (string.IsNullOrWhiteSpace(message))
                message = "Invalid request. Please check your input and try again.";

            await context.Response.WriteAsJsonAsync(new { error = message });
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Invalid JSON in request body");

            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(new { error = "Invalid request data. Please check your input and try again." });
        }
        catch (BadHttpRequestException ex)
        {
            _logger.LogWarning(ex, "Bad HTTP request");

            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(new { error = "Invalid request. Please check your input and try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");

            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred. Please try again later." });
        }
    }
}
