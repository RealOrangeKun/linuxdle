using Linuxdle.Domain.DailyCommands;
using Linuxdle.Domain.Users;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos;
using Linuxdle.Services.Dtos.Enums;
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
                .AsSplitQuery()
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new Exception();

        var guess = await dbContext.DailyCommands
            .Include(c => c.Categories)
            .FirstOrDefaultAsync(c => c.Name.Equals(userGuess, StringComparison.CurrentCultureIgnoreCase),
            cancellationToken)
            ?? throw new Exception();

        return CalculateResults(target, guess);
    }

    private static GuessResultDto CalculateResults(DailyCommand target, DailyCommand guess)
    {
        var isCorrect = target.Id == guess.Id;

        return new GuessResultDto(
            IsCorrect: isCorrect,

            Name: target.Name == guess.Name ? MatchResult.Green : MatchResult.Red,
            Package: target.Package == guess.Package ? MatchResult.Green : MatchResult.Red,
            Section: target.ManSection == guess.ManSection ? MatchResult.Green : MatchResult.Red,
            BuiltIn: target.IsBuiltIn == guess.IsBuiltIn ? MatchResult.Green : MatchResult.Red,

            Categories: EvaluateCategories(target.Categories, guess.Categories),

            Year: target.OriginYear == guess.OriginYear ? MatchResult.Green : MatchResult.Red,
            YearHint: GetYearDirection(target.OriginYear, guess.OriginYear)
        );
    }

    private static MatchResult EvaluateCategories(IEnumerable<DailyCommandCategory> targetCats, IEnumerable<DailyCommandCategory> guessCats)
    {
        var targetIds = targetCats.Select(c => c.Id).ToHashSet();
        var guessIds = guessCats.Select(c => c.Id).ToHashSet();

        if (targetIds.SetEquals(guessIds)) return MatchResult.Green;
        if (targetIds.Overlaps(guessIds)) return MatchResult.Yellow;

        return MatchResult.Red;
    }

    private static YearDirection GetYearDirection(int targetYear, int guessYear)
    {
        if (guessYear < targetYear) return YearDirection.Higher;
        if (guessYear > targetYear) return YearDirection.Lower;
        return YearDirection.None;
    }
}
