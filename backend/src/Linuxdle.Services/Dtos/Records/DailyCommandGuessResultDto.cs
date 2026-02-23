using Linuxdle.Services.Dtos.Enums;

namespace Linuxdle.Services.Dtos.Records;

public sealed record DailyCommandGuessResultDto(
    DailyCommandMatchResults MatchResults,
    GuessCommandDetails GuessCommandDetails
);

public sealed record DailyCommandMatchResults(
    bool IsCorrect,
    MatchResult Name,
    MatchResult Package,
    MatchResult Year,
    YearDirection YearHint,
    MatchResult Section,
    MatchResult BuiltIn,
    MatchResult Posix,
    MatchResult Categories
);

public sealed record GuessCommandDetails(
    string Name,
    string Package,
    int OriginYear,
    int ManSection,
    bool IsBuiltIn,
    bool RequiresArgs,
    bool IsPosix,
    IEnumerable<string> Categories
);
