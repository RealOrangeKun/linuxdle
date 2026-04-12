using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Middleware;

internal sealed class CountryRestrictionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var countryCode = context.Request.Headers["CF-IPCountry"].ToString();

        if (string.Equals(countryCode, "IL", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = StatusCodes.Status451UnavailableForLegalReasons;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = StatusCodes.Status451UnavailableForLegalReasons,
                Title = "Country not supported",
                Detail = "Sorry, your country is not supported.",
                Instance = $"{context.Request.Method} {context.Request.Path}"
            });
            return;
        }

        await next(context);
    }
}