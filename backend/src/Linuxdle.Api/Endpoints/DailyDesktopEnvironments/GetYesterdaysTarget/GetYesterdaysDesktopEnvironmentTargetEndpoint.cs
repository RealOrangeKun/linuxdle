using Linuxdle.Services.DailyDesktopEnvironments;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.GetYesterdaysTarget;

internal sealed class GetYesterdaysDesktopEnvironmentTargetEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-desktop-environments/yesterdays-target", HandleAsync)
        .CacheOutput(policy =>
        {
            var now = DateTime.UtcNow;
            var tomorrow = now.Date.AddDays(1);
            var timeUntilMidnight = tomorrow - now;
            policy.Expire(timeUntilMidnight);
        })
        .WithTags(Tags.DailyDesktopEnvironments)
        .RequireAuthorization();
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IDailyDesktopEnvironmentService dailyDesktopEnvironmentService,
        CancellationToken cancellationToken)
    {
        var yesterdaysTarget = await dailyDesktopEnvironmentService.GetYesterdaysTargetAsync(cancellationToken);

        if (yesterdaysTarget is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(yesterdaysTarget);
    }
}
