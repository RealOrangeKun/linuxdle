namespace Linuxdle.Services.Dtos.Records;

public sealed record DailyDesktopEnvironmentTargetDto(
    int Id,
    string Family,
    string ConfigurationLanguage,
    int ReleaseYear,
    string PrimaryLanguage,
    ICollection<DesktopEnvironmentScreenshotDto> Screenshots);
