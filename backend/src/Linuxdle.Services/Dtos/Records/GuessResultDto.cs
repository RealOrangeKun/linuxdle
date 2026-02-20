using Linuxdle.Services.Dtos.Enums;

namespace Linuxdle.Services.Dtos.Records;

public sealed record GuessResultDto(
    MatchResults MatchResults,
    GuessCommandDetails GuessCommandDetails
);

public sealed record MatchResults(
    bool IsCorrect,
    MatchResult Name,
    MatchResult Package,
    MatchResult Categories,
    MatchResult Year,
    YearDirection YearHint,
    MatchResult Section,
    MatchResult BuiltIn
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
