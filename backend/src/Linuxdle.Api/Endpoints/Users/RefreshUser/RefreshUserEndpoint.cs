using Linuxdle.Api.Extensions;
using Linuxdle.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Linuxdle.Api.Endpoints.Users.RefreshUser;

internal sealed class RefreshUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/users/refresh-token", HandleAsync)
        .WithTags(Tags.Users);
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IUserService userService,
        HttpContext context,
        IOptions<RefreshTokenOptions> options,
        CancellationToken cancellationToken)
    {
        var refreshTokenOptions = options.Value;
        string? oldRefreshToken = context.Request.Cookies[refreshTokenOptions.CookieName];

        if (oldRefreshToken is null)
        {
            return Results.Unauthorized();
        }

        var tokens = await userService.RefreshUserToken(oldRefreshToken, cancellationToken);

        context.Response.AppendRefreshToken(tokens.RefreshToken, refreshTokenOptions);

        return Results.Ok(tokens.AccessToken);
    }
}
