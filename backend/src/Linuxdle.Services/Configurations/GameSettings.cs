namespace Linuxdle.Services.Configurations;

public sealed class GameSettings
{
    public GameSettings()
    {
    }

    public GameSettings(int minGuessesToGiveUp)
    {
        MinGuessesToGiveUp = minGuessesToGiveUp;
    }

    public const string SectionName = "GameSettings";

    public int MinGuessesToGiveUp { get; init; } = 5;
}
