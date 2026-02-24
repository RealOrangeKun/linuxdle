namespace Linuxdle.Services.DailyDistros;

public sealed class DistroImageOptions
{
    public double InitialZoomPercentage { get; init; } = 0.5;
    public int MaxRetries { get; init; } = 6;
    public int OutputSize { get; init; } = 300;
}
