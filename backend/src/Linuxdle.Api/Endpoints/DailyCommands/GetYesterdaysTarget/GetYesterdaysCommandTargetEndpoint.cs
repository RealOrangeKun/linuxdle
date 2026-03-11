using Linuxdle.Services.DailyCommands;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyCommands.GetYesterdaysTarget;

internal sealed class GetYesterdaysCommandTargetEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-commands/yesterdays-target", HandleAsync)
        .CacheOutput(policy =>
        {
            var now = DateTime.UtcNow;
            var tomorrow = now.Date.AddDays(1);
            var timeUntilMidnight = tomorrow - now;
            policy.Expire(timeUntilMidnight);
        })
        .WithTags(Tags.DailyCommands)
        .RequireAuthorization();
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IDailyCommandService dailyCommandService,
        CancellationToken cancellationToken)
    {
        var yesterdaysTarget = await dailyCommandService.GetYesterdaysTargetAsync(cancellationToken);

        if (yesterdaysTarget is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(yesterdaysTarget);
    }
}
