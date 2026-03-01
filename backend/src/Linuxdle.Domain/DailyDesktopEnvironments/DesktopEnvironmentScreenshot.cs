namespace Linuxdle.Domain.DailyDesktopEnvironments;

public sealed class DesktopEnvironmentScreenshot
{
    private DesktopEnvironmentScreenshot() { }

    public int Id { get; private set; }
    public int DailyDesktopEnvironmentId { get; private set; }
    public string FilePath { get; private set; } = null!;
    public string Credit { get; private set; } = null!;

    public static DesktopEnvironmentScreenshot Create(int dailyDesktopEnvironmentId, string filePath, string credit)
    {
        return new()
        {
            DailyDesktopEnvironmentId = dailyDesktopEnvironmentId,
            FilePath = filePath,
            Credit = credit
        };
    }
}
