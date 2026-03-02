using System.Net.Mime;
using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistroIcon;

internal sealed class GetDailyDistroIconEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-distros/daily-distro.png", HandleAsync)
        .WithTags(Tags.DailyDistros)
        .RequireAuthorization();
    }

    private async Task<IResult> HandleAsync(
        [AsParameters] GetDailyDistroIconRequest request,
        [FromServices] IDailyDistroService dailyDistroService,
        CancellationToken cancellationToken
    )
    {
        var imageBytes = await dailyDistroService.GenerateDailyDistroLogoAsync(
            request.NumberOfTries,
            request.HardMode,
            cancellationToken);

        return Results.File(imageBytes, MediaTypeNames.Image.Png);
    }
}