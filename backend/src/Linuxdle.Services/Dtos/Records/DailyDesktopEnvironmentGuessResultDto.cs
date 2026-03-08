namespace Linuxdle.Services.Dtos.Records;

public sealed record DailyDesktopEnvironmentGuessResultDto(
    bool IsCorrect,
    string? Family = null,
    string? ConfigurationLanguage = null,
    int? ReleaseYear = null,
    string? PrimaryLanguage = null);