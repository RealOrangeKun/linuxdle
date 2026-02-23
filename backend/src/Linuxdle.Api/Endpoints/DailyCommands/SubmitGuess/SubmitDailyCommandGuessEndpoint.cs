using Linuxdle.Api.Filters;
using Linuxdle.Services.DailyCommands;
using Linuxdle.Services.Dtos.Records;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyCommands.SubmitGuess;

internal sealed partial class SubmitDailyCommandGuessEndpoint
    : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-commands/guesses", HandleAsync)
        .AddEndpointFilter<ValidationFilter<SubmitDailyCommandGuessRequest>>();
    }

    public static async Task<IResult> HandleAsync(
        [FromBody] SubmitDailyCommandGuessRequest request,
        [FromServices] IDailyCommandService dailyCommandService,
        CancellationToken cancellationToken)
    {
        DailyCommandGuessResultDto response = await dailyCommandService.HandleUserGuessAsync(request.UserGuess, cancellationToken);

        return Results.Ok(response);
    }
}