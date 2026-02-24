using Linuxdle.Services.DailyCommands;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyCommands.GetDailyCommands;

internal sealed class GetDailyCommandsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-commands", HandleAsync)
        .CacheOutput(policy => policy.Expire(TimeSpan.FromHours(24)))
        .WithTags(Tags.DailyCommands);
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IDailyCommandService dailyCommandService,
        CancellationToken cancellationToken)
    {
        var dailyCommandNames = await dailyCommandService.GetDailyCommandsAsync(cancellationToken);

        return Results.Ok(dailyCommandNames);
    }
}
