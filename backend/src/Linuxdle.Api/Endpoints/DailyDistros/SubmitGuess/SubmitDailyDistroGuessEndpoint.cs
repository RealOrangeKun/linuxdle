using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.SubmitGuess;

internal sealed class SubmitDailyDistroGuessEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-distros/guesses", HandleAsync)
        .WithTags(Tags.DailyDistros);
    }

    private async Task<IResult> HandleAsync(
        [FromBody] SubmitDailyDistroGuessRequest request,
        [FromServices] IDailyDistroService dailyDistroService,
        CancellationToken cancellationToken)
    {
        var response = await dailyDistroService.HandleUserGuessAsync(request.UserGuess, cancellationToken);

        return Results.Ok(response);
    }
}