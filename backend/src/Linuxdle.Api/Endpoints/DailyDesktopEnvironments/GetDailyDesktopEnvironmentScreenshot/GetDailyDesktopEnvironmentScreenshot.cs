using System.Net.Mime;
using Linuxdle.Services.DailyDesktopEnvironments;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.GetDailyDesktopEnvironmentScreenshot;

internal sealed class GetDailyDesktopEnvironmentScreenshot : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-desktop-environments/daily-desktop-environment.png", HandleAsync);
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IDailyDesktopEnvironmentService dailyDesktopEnvironmentService,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var bytes = await dailyDesktopEnvironmentService.GetDailyDesktopEnvironmentScreenshot(cancellationToken);

        var now = DateTime.UtcNow;
        var secondsUntilMidnight = (int)(now.Date.AddDays(1) - now).TotalSeconds;

        httpContext.Response.GetTypedHeaders().CacheControl =
            new CacheControlHeaderValue()
            {
                Public = true,
                MaxAge = TimeSpan.FromSeconds(secondsUntilMidnight)
            };

        return Results.File(bytes, MediaTypeNames.Image.Png, lastModified: now.Date, enableRangeProcessing: true);
    }
}
