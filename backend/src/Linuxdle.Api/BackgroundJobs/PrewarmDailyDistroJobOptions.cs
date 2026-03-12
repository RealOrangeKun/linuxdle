namespace Linuxdle.Api.BackgroundJobs;

public sealed class PrewarmDailyDistroJobOptions
{
    public required string CronSchedule { get; init; }
}
