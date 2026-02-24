using System;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistros;

internal sealed class GetDailyDistrosEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-distros", HandleAsync);
    }

    private async Task<IResult> HandleAsync()
    {
        return Results.Ok();
    }
}
