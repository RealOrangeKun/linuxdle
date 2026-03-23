using Linuxdle.Api.Extensions;
using Linuxdle.Services.DailyDistros;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Linuxdle.Api.Endpoints.DailyDistros.GiveUp;

internal sealed class GiveUpDailyDistroEndpoint
    : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-distros/give-up", HandleAsync)
        .WithTags(Tags.DailyDistros)
        .RequireAuthorization();
    }

    public static async Task<IResult> HandleAsync(
        [FromServices] IDailyDistroService dailyDistroService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        var response = await dailyDistroService.HandleUserGiveUpAsync(userId, cancellationToken);

        return Results.Ok(response);
    }
}
