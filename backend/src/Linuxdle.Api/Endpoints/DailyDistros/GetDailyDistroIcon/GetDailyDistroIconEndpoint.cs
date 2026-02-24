using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistroIcon;

internal sealed class GetDailyDistroIconEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-distros/icon", HandleAsync);
    }

    private async Task<IResult> HandleAsync(
        [AsParameters] GetDailyDistroIconRequest request,
        [FromServices] IDailyDistroService dailyDistroService,
        CancellationToken cancellationToken
    )
    {
        var imageBytes = await dailyDistroService.GenerateDailyDistroLogoAsync(request.NumberOfTries, cancellationToken);

        return Results.File(imageBytes, "image/png");
    }
}