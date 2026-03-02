namespace Linuxdle.Services.Dtos.Records;

public sealed record DailyDesktopEnvironmentTargetDto(
    int Id,
    ICollection<DesktopEnvironmentScreenshotDto> Screenshots);
