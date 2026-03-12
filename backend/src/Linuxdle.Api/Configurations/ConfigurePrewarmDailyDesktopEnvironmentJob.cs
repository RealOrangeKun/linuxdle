using Linuxdle.Api.BackgroundJobs;
using Microsoft.Extensions.Options;
using Quartz;

namespace Linuxdle.Api.Configurations;

internal sealed class ConfigurePrewarmDailyDesktopEnvironmentJob(IOptions<PrewarmDailyDesktopEnvironmentJobOptions> options)
    : IConfigureOptions<QuartzOptions>
{
    private readonly PrewarmDailyDesktopEnvironmentJobOptions _options = options.Value;

    public void Configure(QuartzOptions options)
    {
        var jobKey = new JobKey(nameof(PrewarmDailyDesktopEnvironmentJob));

        options
            .AddJob<PrewarmDailyDesktopEnvironmentJob>(builder => builder.WithIdentity(jobKey))
            .AddTrigger(builder =>
                builder
                    .ForJob(jobKey)
                    .WithIdentity($"{jobKey.Name}-trigger")
                    .StartAt(DateTimeOffset.UtcNow.AddMinutes(1))
                    .WithSimpleSchedule(s => s.WithIntervalInSeconds(10).RepeatForever())
                    .WithCronSchedule(_options.CronSchedule));
    }
}
