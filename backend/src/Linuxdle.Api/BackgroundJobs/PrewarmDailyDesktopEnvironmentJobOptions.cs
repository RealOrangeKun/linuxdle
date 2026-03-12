namespace Linuxdle.Api.BackgroundJobs;

public sealed class PrewarmDailyDesktopEnvironmentJobOptions
{
    public required string CronSchedule { get; init; }
}
