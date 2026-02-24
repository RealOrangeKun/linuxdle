namespace Linuxdle.Services.DailyDistros;

public sealed class DistroImageOptions
{
    public double InitialZoomPercentage { get; init; } = 0.5;
    public double ZoomOutIncrement { get; init; } = 0.05;
    public int OutputSize { get; init; } = 300;
}
