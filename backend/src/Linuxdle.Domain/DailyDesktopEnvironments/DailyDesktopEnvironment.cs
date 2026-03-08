namespace Linuxdle.Domain.DailyDesktopEnvironments;

public sealed class DailyDesktopEnvironment
{
    private DailyDesktopEnvironment() { }

    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Slug { get; private set; } = null!;
    public DesktopEnvironmentType Type { get; private set; }
    public string Compositor { get; private set; } = null!;
    public string Family { get; private set; } = null!;
    public string ConfigurationLanguage { get; private set; } = null!;
    public int ReleaseYear { get; private set; }
    public string PrimaryLanguage { get; private set; } = null!;

    public ICollection<DesktopEnvironmentScreenshot> DesktopEnvironmentScreenshots { get; private set; } = [];

    public static DailyDesktopEnvironment Create(
        string name,
        DesktopEnvironmentType type,
        string compositor,
        string family,
        string configurationLanguage,
        int releaseYear,
        string primaryLanguage)
    {
        return new()
        {
            Name = name,
            Type = type,
            Compositor = compositor,
            Family = family,
            ConfigurationLanguage = configurationLanguage,
            ReleaseYear = releaseYear,
            PrimaryLanguage = primaryLanguage
        };
    }
}
