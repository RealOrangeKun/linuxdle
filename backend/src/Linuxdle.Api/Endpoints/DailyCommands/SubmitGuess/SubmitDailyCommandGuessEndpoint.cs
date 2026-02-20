using Linuxdle.Services.DailyCommands;
using Linuxdle.Services.Dtos.Records;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyCommands.SubmitGuess;

internal sealed class SubmitDailyCommandGuessEndpoint
    : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-commands/guesses", HandleAsync);
    }

    public static async Task<IResult> HandleAsync(
        [FromBody] SubmitDailyCommandGuessRequest request,
        [FromServices] IDailyCommandService dailyCommandService,
        CancellationToken cancellationToken)
    {
        GuessResultDto response = await dailyCommandService.HandleUserGuess(request.UserGuess, request.GameId, cancellationToken);

        return Results.Ok(response);
    }

    public sealed record SubmitDailyCommandGuessRequest(string UserGuess, int GameId);
}