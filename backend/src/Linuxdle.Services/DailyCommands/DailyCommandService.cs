using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos.Enums;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace Linuxdle.Services.DailyCommands;

internal sealed class DailyCommandService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache)
    : IDailyCommandService
{
    public async Task<GuessResultDto> HandleUserGuess(string userGuess, int gameId, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await hybridCache.GetOrCreateAsync(
            $"daily_target_{today}",
            async cancel => await dbContext.DailyCommands
                .Include(c => c.Categories)
                .Where(c => dbContext.DailyPuzzles
                .Any(p => p.ScheduledDate == today && p.TargetId == c.Id))
                .Select(c => new DailyCommandDto(
                    c.Id,
                    c.Name,
                    c.Package,
                    c.OriginYear,
                    c.ManSection,
                    c.IsBuiltIn,
                    c.RequiresArgs,
                    c.IsPosix,
                    c.Categories.Select(cat => cat.Id).ToHashSet(),
                    c.Categories.Select(cat => cat.Name).ToList()
                ))
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new Exception();

        var guess = await hybridCache.GetOrCreateAsync(
            $"command_{userGuess.ToLower()}",
            async cancel => await dbContext.DailyCommands
                .Include(c => c.Categories)
                .Where(c => c.Name.ToLower() == userGuess.ToLower())
                .Select(c => new DailyCommandDto(
                    c.Id,
                    c.Name,
                    c.Package,
                    c.OriginYear,
                    c.ManSection,
                    c.IsBuiltIn,
                    c.RequiresArgs,
                    c.IsPosix,
                    c.Categories.Select(cat => cat.Id).ToHashSet(),
                    c.Categories.Select(cat => cat.Name).ToList()
                ))
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new Exception();

        return CalculateResults(target, guess);
    }

    private static GuessResultDto CalculateResults(DailyCommandDto target, DailyCommandDto guess)
    {
        var isCorrect = target.Id == guess.Id;

        var matchResults = new MatchResults(
            IsCorrect: isCorrect,
            Name: target.Name == guess.Name ? MatchResult.Green : MatchResult.Red,
            Package: target.Package == guess.Package ? MatchResult.Green : MatchResult.Red,
            Categories: EvaluateCategories(target.CategoryIds, guess.CategoryIds),
            Year: target.OriginYear == guess.OriginYear ? MatchResult.Green : MatchResult.Red,
            YearHint: GetYearDirection(target.OriginYear, guess.OriginYear),
            Section: target.ManSection == guess.ManSection ? MatchResult.Green : MatchResult.Red,
            BuiltIn: target.IsBuiltIn == guess.IsBuiltIn ? MatchResult.Green : MatchResult.Red
        );

        var guessDetails = new GuessCommandDetails(
            Name: guess.Name,
            Package: guess.Package,
            OriginYear: guess.OriginYear,
            ManSection: guess.ManSection,
            IsBuiltIn: guess.IsBuiltIn,
            RequiresArgs: guess.RequiresArgs,
            IsPosix: guess.IsPosix,
            Categories: guess.CategoryNames
        );

        return new GuessResultDto(matchResults, guessDetails);
    }

    private static MatchResult EvaluateCategories(HashSet<int> targetCatIds, HashSet<int> guessCatIds)
    {
        if (targetCatIds.SetEquals(guessCatIds)) return MatchResult.Green;
        if (targetCatIds.Overlaps(guessCatIds)) return MatchResult.Yellow;

        return MatchResult.Red;
    }

    private static YearDirection GetYearDirection(int targetYear, int guessYear)
    {
        if (guessYear < targetYear) return YearDirection.Higher;
        if (guessYear > targetYear) return YearDirection.Lower;
        return YearDirection.None;
    }
}
