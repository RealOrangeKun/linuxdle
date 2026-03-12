using Linuxdle.Api.BackgroundJobs;
using Linuxdle.Services.Users;
using Microsoft.Extensions.Options;
using Quartz;

namespace Linuxdle.Api.Configurations;

internal sealed class ConfigureCleanUsersJob(IOptions<CleanUsersJobOptions> options)
    : IConfigureOptions<QuartzOptions>
{
    private readonly CleanUsersJobOptions _cleanUsersJobOptions = options.Value;
    public void Configure(QuartzOptions options)
    {
        var jobKey = new JobKey(nameof(CleanUsersJob));

        options
            .AddJob<CleanUsersJob>(builder => builder.WithIdentity(jobKey))
            .AddTrigger(builder =>
                builder
                    .ForJob(jobKey)
                    .WithIdentity($"{jobKey.Name}-trigger")
                    .WithCronSchedule(_cleanUsersJobOptions.CronSchedule));
    }
}
