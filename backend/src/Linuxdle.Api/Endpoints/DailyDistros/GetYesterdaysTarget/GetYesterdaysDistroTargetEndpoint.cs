using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetYesterdaysTarget;

internal sealed class GetYesterdaysDistroTargetEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-distros/yesterdays-target", HandleAsync)
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
        var yesterdaysTarget = await dailyDistroService.GetYesterdaysTargetAsync(cancellationToken);

        if (yesterdaysTarget is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(yesterdaysTarget);
    }
}
