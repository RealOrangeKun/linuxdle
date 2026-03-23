using Linuxdle.Api.Extensions;
using Linuxdle.Services.DailyDesktopEnvironments;
using Linuxdle.Services.Dtos.Records;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.GiveUp;

internal sealed partial class GiveUpDailyDesktopEnvironmentEndpoint
    : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-desktop-environments/give-up", HandleAsync)
        .WithTags(Tags.DailyDesktopEnvironments)
        .RequireAuthorization();
    }

    public static async Task<IResult> HandleAsync(
        [FromServices] IDailyDesktopEnvironmentService service,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        DailyDesktopEnvironmentDto response = await service.HandleUserGiveUpAsync(userId, cancellationToken);

        return Results.Ok(response);
    }
}
