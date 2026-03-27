using System.Net.Mime;
using Linuxdle.Api.Filters;
using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistroIcon;

internal sealed class GetDailyDistroIconEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-distros/daily-distro.png", HandleAsync)
            .AddEndpointFilter<ValidationFilter<GetDailyDistroIconRequest>>()
            .WithTags(Tags.DailyDistros);
    }

    private async Task<IResult> HandleAsync(
        [AsParameters] GetDailyDistroIconRequest request,
        [FromServices] IDailyDistroService dailyDistroService,
        HttpContext httpContext,
        CancellationToken cancellationToken
    )
    {
        var imageBytes = await dailyDistroService.GenerateDailyDistroLogoAsync(
            request.NumberOfTries,
            request.HardMode,
            cancellationToken);

        var now = DateTime.UtcNow;
        var secondsUntilMidnight = now.Date.AddDays(1) - now;

        httpContext.Response.GetTypedHeaders().CacheControl =
            new CacheControlHeaderValue()
            {
                Public = true,
                MaxAge = secondsUntilMidnight
            };

        return Results.File(imageBytes, MediaTypeNames.Image.Png, lastModified: now.Date, enableRangeProcessing: true);
    }
}