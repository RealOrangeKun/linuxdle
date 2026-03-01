namespace Linuxdle.Services.Users;

public sealed class CleanUsersJobOptions
{
    public required string CronSchedule { get; init; }
}
