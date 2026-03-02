using System.Net.Mime;
using Linuxdle.Services.DailyDesktopEnvironments;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.GetDailyDesktopEnvironmentScreenshot;

internal sealed class GetDailyDesktopEnvironmentScreenshot : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-desktop-environments/daily-desktop-environment.png", HandleAsync);
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IDailyDesktopEnvironmentService dailyDesktopEnvironmentService,
        CancellationToken cancellationToken)
    {
        var bytes = await dailyDesktopEnvironmentService.GetDailyDesktopEnvironmentScreenshot(cancellationToken);

        return Results.File(bytes, MediaTypeNames.Image.Png);
    }
}
