using Linuxdle.Api.Filters;
using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.SubmitGuess;

internal sealed class SubmitDailyDistroGuessEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-distros/guesses", HandleAsync)
        .AddEndpointFilter<ValidationFilter<SubmitDailyDistroGuessRequest>>()
        .WithTags(Tags.DailyDistros)
        .RequireAuthorization();
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