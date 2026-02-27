using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistros;

internal sealed class GetDailyDistrosEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-distros", HandleAsync)
        .CacheOutput(policy => policy.Expire(TimeSpan.FromHours(24)))
        .WithTags(Tags.DailyDistros)
        .RequireAuthorization();
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IDailyDistroService dailyDistroService,
        CancellationToken cancellationToken)
    {
        var distros = await dailyDistroService.GetDailyDistrosAsync(cancellationToken);

        return Results.Ok(distros);
    }
}
