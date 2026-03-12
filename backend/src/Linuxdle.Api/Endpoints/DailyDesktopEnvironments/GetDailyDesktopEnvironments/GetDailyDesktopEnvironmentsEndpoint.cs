using Linuxdle.Services.DailyDesktopEnvironments;
using Linuxdle.Services.Dtos.Records;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.GetDailyDesktopEnvironments;

internal sealed class GetDailyDesktopEnvironmentsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-desktop-environments", HandleAsync)
        .CacheOutput(policy =>
        {
            var now = DateTime.UtcNow;
            var tomorrow = now.Date.AddDays(1);
            var timeUntilMidnight = tomorrow - now;
            policy.Expire(timeUntilMidnight);
        })
        .WithTags(Tags.DailyDesktopEnvironments);
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IDailyDesktopEnvironmentService dailyDesktopEnvironmentService,
        CancellationToken cancellationToken)
    {
        var result = await dailyDesktopEnvironmentService.GetDailyDesktopEnvironmentsAsync(cancellationToken);

        return Results.Ok(result);
    }
}
