using Linuxdle.Api.Filters;
using Linuxdle.Services.DailyDesktopEnvironments;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.SubmitGuess;

public sealed record SubmitDailyDesktopEnvironmentGuessRequest(string UserGuess);

internal sealed class SubmitDailyDesktopEnvironmentGuessEndpoint
    : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-desktop-environments/guesses", HandleAsync)
        .AddEndpointFilter<ValidationFilter<SubmitDailyDesktopEnvironmentGuessRequest>>()
        .WithTags(Tags.DailyDesktopEnvironments);
    }
    private async Task<IResult> HandleAsync(
        [FromServices] IDailyDesktopEnvironmentService dailyDesktopEnvironmentService,
        [FromBody] SubmitDailyDesktopEnvironmentGuessRequest request,
        CancellationToken cancellationToken)
    {
        var result = await dailyDesktopEnvironmentService.HandleUserGuessAsync(request.UserGuess, cancellationToken);

        return Results.Ok(result);
    }
}