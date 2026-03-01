namespace Linuxdle.Domain.DailyDesktopEnvironments;

public sealed class DailyDesktopEnvironment
{
    private DailyDesktopEnvironment() { }

    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Slug { get; private set; } = null!;
    public DesktopEnvironmentType Type { get; private set; }
    public string Compositor { get; private set; } = null!;

    public ICollection<DesktopEnvironmentScreenshot> DesktopEnvironmentScreenshots { get; private set; } = [];

    public static DailyDesktopEnvironment Create(string name, DesktopEnvironmentType type, string compositor)
    {
        return new()
        {
            Name = name,
            Type = type,
            Compositor = compositor
        };
    }
}
