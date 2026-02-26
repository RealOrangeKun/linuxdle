using Linuxdle.Api.Extensions;
using Linuxdle.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Linuxdle.Api.Endpoints.Users.RegisterUser;


internal sealed class RegisterUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/users", HandleAsync)
            .RequireRateLimiting("registerUser");
    }

    private async Task<IResult> HandleAsync(
        [FromServices] IUserService userService,
        IOptions<RefreshTokenOptions> refreshTokenOptions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var tokens = await userService.RegisterUserAsync(cancellationToken);

        context.Response.AppendRefreshToken(tokens.RefreshToken, refreshTokenOptions.Value);

        return Results.Ok(tokens.AccessToken);
    }
}
