using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistros;

internal sealed class GetDailyDistrosEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-distros", HandleAsync)
        .CacheOutput(policy =>
        {
            var now = DateTime.UtcNow;
            var tomorrow = now.Date.AddDays(1);
            var timeUntilMidnight = tomorrow - now;
            policy.Expire(timeUntilMidnight);
        })
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
