namespace Linuxdle.Services.DailyPuzzles;

public sealed class DailyPuzzleOptions
{
    public required string CronSchedule { get; init; }
    public int DaysToSchedule { get; init; } = 30;
}
