namespace Linuxdle.Services.DailyDistros;

public sealed class DistroImageOptions
{
    public double InitialQualityPercentage { get; init; } = 0.2;
    public int MaxRetries { get; init; } = 6;
    public int OutputSize { get; init; } = 300;
}
