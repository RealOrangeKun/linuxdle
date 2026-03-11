using Linuxdle.Api.Extensions;
using Linuxdle.Api.Filters;
using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        var response = await dailyDistroService.HandleUserGuessAsync(userId, request.UserGuess, cancellationToken);

        return Results.Ok(response);
    }
}