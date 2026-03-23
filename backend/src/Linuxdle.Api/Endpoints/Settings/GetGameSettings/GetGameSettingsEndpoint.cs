using Linuxdle.Api.Extensions;
using Linuxdle.Services.Configurations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Linuxdle.Api.Endpoints.Settings.GetGameSettings;

internal sealed partial class GetGameSettingsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/settings/game-settings", HandleAsync)
            .WithTags(Tags.Settings);
    }

    public static IResult HandleAsync([FromServices] IOptions<GameSettings> gameSettings)
    {
        return Results.Ok(new { gameSettings.Value.MinGuessesToGiveUp });
    }
}
