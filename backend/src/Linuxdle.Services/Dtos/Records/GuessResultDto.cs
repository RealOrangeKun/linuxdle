using Linuxdle.Services.Dtos.Enums;

namespace Linuxdle.Services.Dtos;

public sealed record GuessResultDto(
    bool IsCorrect,
    MatchResult Name,
    MatchResult Package,
    MatchResult Categories,
    MatchResult Year,
    YearDirection YearHint,
    MatchResult Section,
    MatchResult BuiltIn
);
