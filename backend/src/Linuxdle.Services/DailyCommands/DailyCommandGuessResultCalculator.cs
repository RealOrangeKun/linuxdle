using Linuxdle.Services.Dtos.Enums;
using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyCommands;

internal static class DailyCommandGuessResultCalculator
{
    public static DailyCommandGuessResultDto CalculateResults(DailyCommandDto target, DailyCommandDto guess, CommandInfoDetails? info = null)
    {
        var isCorrect = target.Id == guess.Id;

        var matchResults = new DailyCommandMatchResults(
            IsCorrect: isCorrect,
            Name: target.Name == guess.Name ? MatchResult.Green : MatchResult.Red,
            Package: target.Package == guess.Package ? MatchResult.Green : MatchResult.Red,
            Categories: EvaluateCategories(target.CategoryIds, guess.CategoryIds),
            Year: target.OriginYear == guess.OriginYear ? MatchResult.Green : MatchResult.Red,
            YearHint: GetYearDirection(target.OriginYear, guess.OriginYear),
            Section: target.ManSection == guess.ManSection ? MatchResult.Green : MatchResult.Red,
            BuiltIn: target.IsBuiltIn == guess.IsBuiltIn ? MatchResult.Green : MatchResult.Red,
            Posix: target.IsPosix == guess.IsPosix ? MatchResult.Green : MatchResult.Red
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

        return new DailyCommandGuessResultDto(matchResults, guessDetails, isCorrect ? info : null);
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
