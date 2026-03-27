using Linuxdle.Api.Extensions;
using Linuxdle.Api.Filters;
using Linuxdle.Services.DailyDesktopEnvironments;
using Linuxdle.Services.Users;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.SubmitGuess;

public sealed record SubmitDailyDesktopEnvironmentGuessRequest(string UserGuess, int NumberOfGuesses = 0);

internal sealed class SubmitDailyDesktopEnvironmentGuessEndpoint
    : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-desktop-environments/guesses", HandleAsync)
        .AddEndpointFilter<ValidationFilter<SubmitDailyDesktopEnvironmentGuessRequest>>()
        .WithTags(Tags.DailyDesktopEnvironments)
        .RequireAuthorization();
    }
    private async Task<IResult> HandleAsync(
        [FromServices] IDailyDesktopEnvironmentService dailyDesktopEnvironmentService,
        [FromServices] IUserStreakService userStreakService,
        [FromBody] SubmitDailyDesktopEnvironmentGuessRequest request,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var result = await dailyDesktopEnvironmentService.HandleUserGuessAsync(userId, request.UserGuess, request.NumberOfGuesses, cancellationToken);

        await userStreakService.UpdateStreakIfAllGamesCompletedAsync(userId, today, cancellationToken);

        return Results.Ok(result);
    }
}