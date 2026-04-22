using Linuxdle.Api.Extensions;
using Linuxdle.Services.DailyCommands;
using Linuxdle.Services.Dtos.Records;
using Linuxdle.Services.Users;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Linuxdle.Api.Endpoints.DailyCommands.GiveUp;

internal sealed partial class GiveUpDailyCommandEndpoint
    : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-commands/give-up", HandleAsync)
        .WithTags(Tags.DailyCommands)
        .RequireAuthorization();
    }

    public static async Task<IResult> HandleAsync(
        [FromServices] IDailyCommandService dailyCommandService,
        [FromServices] IUserStreakService userStreakService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        DailyCommandGiveUpResultDto response = await dailyCommandService.HandleUserGiveUpAsync(userId, cancellationToken);
        await userStreakService.UpdateStreakIfAllGamesCompletedAsync(userId, today, cancellationToken);

        return Results.Ok(response);
    }
}
