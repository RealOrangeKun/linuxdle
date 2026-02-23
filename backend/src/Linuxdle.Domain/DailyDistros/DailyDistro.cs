namespace Linuxdle.Domain.DailyDistros;

public sealed class DailyDistro
{
    private DailyDistro() { }

    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Slug { get; private set; } = null!;
    public string LogoPath { get; private set; } = null!;
    public string BaseDistro { get; private set; } = null!;
    public string DefaultDe { get; private set; } = null!;
    public int ReleaseYear { get; private set; }

    public static DailyDistro Create(string name, string slug, string logoPath, string baseDistro, string defaultDe, int releaseYear)
    {
        return new()
        {
            Name = name,
            Slug = slug,
            LogoPath = logoPath,
            BaseDistro = baseDistro,
            DefaultDe = defaultDe,
            ReleaseYear = releaseYear
        };
    }
}
