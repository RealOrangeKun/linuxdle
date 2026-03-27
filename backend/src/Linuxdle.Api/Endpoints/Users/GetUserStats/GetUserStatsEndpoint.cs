using Linuxdle.Api.Extensions;
using Linuxdle.Services.Dtos.Records;
using Linuxdle.Services.Users;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Linuxdle.Api.Endpoints.Users.GetUserStats;

internal sealed class GetUserStatsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/users/stats", HandleAsync)
            .WithTags(Tags.Users)
            .RequireAuthorization();
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IUserStreakService userStreakService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();

        var streak = await userStreakService.GetUserStreakAsync(userId, cancellationToken);

        return Results.Ok(streak);
    }
}
