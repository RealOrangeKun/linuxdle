using System.Net.Mime;
using System.Security.Claims;
using Linuxdle.Api.Extensions;
using Linuxdle.Api.Filters;
using Linuxdle.Services.DailyDesktopEnvironments;
using Linuxdle.Services.DailyDistros;
using Linuxdle.Services.PastPuzzles;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace Linuxdle.Api.Endpoints.PastPuzzles;

public sealed record SubmitPastPuzzleGuessRequest(string UserGuess, int NumberOfGuesses = 0);
public sealed record GetPastDistroLogoRequest(int NumberOfTries, bool HardMode);

internal sealed class PastPuzzlesEndpoints : IEndpoint
{
    private const string Tag = "PastPuzzles";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/past-puzzles")
            .WithTags(Tag)
            .RequireAuthorization();

        group.MapGet("/", GetPastPuzzlesAsync);
        group.MapPost("/{puzzleId:int}/guesses", HandlePastGuessAsync);
        group.MapPost("/{puzzleId:int}/give-up", HandlePastGiveUpAsync);
        group.MapPost("/{puzzleId:int}/reset", ResetPastPuzzleAsync);

        app.MapGet("/past-puzzles/{puzzleId:int}/logo", GetPastDistroLogoAsync)
            .WithTags(Tag)
            .AllowAnonymous();
        app.MapGet("/past-puzzles/{puzzleId:int}/screenshot", GetPastDesktopEnvironmentScreenshotAsync)
            .WithTags(Tag)
            .AllowAnonymous();
    }

    private static async Task<IResult> GetPastPuzzlesAsync(
        [FromServices] IPastPuzzlesService pastPuzzlesService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var result = await pastPuzzlesService.GetPastPuzzlesAsync(userId, cancellationToken);
        return Results.Ok(result);
    }

    private static async Task<IResult> HandlePastGuessAsync(
        int puzzleId,
        [FromBody] SubmitPastPuzzleGuessRequest request,
        [FromServices] IPastPuzzlesService pastPuzzlesService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserGuess))
        {
            return Results.BadRequest(new { Message = "Guess cannot be empty." });
        }

        var userId = user.GetUserId();
        var result = await pastPuzzlesService.HandlePastGuessAsync(
            userId,
            puzzleId,
            request.UserGuess,
            request.NumberOfGuesses,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> HandlePastGiveUpAsync(
        int puzzleId,
        [FromServices] IPastPuzzlesService pastPuzzlesService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var result = await pastPuzzlesService.HandlePastGiveUpAsync(userId, puzzleId, cancellationToken);
        return Results.Ok(result);
    }

    private static async Task<IResult> ResetPastPuzzleAsync(
        int puzzleId,
        [FromServices] IPastPuzzlesService pastPuzzlesService,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        await pastPuzzlesService.ResetPastPuzzleAsync(userId, puzzleId, cancellationToken);
        return Results.Ok(new { Message = "Puzzle progress reset successfully." });
    }

    private static async Task<IResult> GetPastDistroLogoAsync(
        int puzzleId,
        [AsParameters] GetPastDistroLogoRequest request,
        [FromServices] IDailyDistroService dailyDistroService,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var imageBytes = await dailyDistroService.GeneratePastDistroLogoAsync(
            puzzleId,
            request.NumberOfTries,
            request.HardMode,
            cancellationToken);

        httpContext.Response.GetTypedHeaders().CacheControl =
            new CacheControlHeaderValue()
            {
                Public = true,
                MaxAge = TimeSpan.FromHours(1)
            };

        return Results.File(imageBytes, MediaTypeNames.Image.Png, lastModified: DateTime.UtcNow.Date, enableRangeProcessing: true);
    }

    private static async Task<IResult> GetPastDesktopEnvironmentScreenshotAsync(
        int puzzleId,
        [FromServices] IDailyDesktopEnvironmentService dailyDesktopEnvironmentService,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var bytes = await dailyDesktopEnvironmentService.GetPastDesktopEnvironmentScreenshotAsync(puzzleId, cancellationToken);

        httpContext.Response.GetTypedHeaders().CacheControl =
            new CacheControlHeaderValue()
            {
                Public = true,
                MaxAge = TimeSpan.FromHours(1)
            };

        return Results.File(bytes, MediaTypeNames.Image.Png, lastModified: DateTime.UtcNow.Date, enableRangeProcessing: true);
    }
}
