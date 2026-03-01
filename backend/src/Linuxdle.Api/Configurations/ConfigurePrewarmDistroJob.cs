using Linuxdle.Api.BackgroundJobs;
using Microsoft.Extensions.Options;
using Quartz;

namespace Linuxdle.Api.Configurations;

internal sealed class ConfigurePrewarmDistroJob() : IConfigureOptions<QuartzOptions>
{
    public void Configure(QuartzOptions options)
    {
        var jobKey = new JobKey(nameof(PrewarmDailyDistroJob));

        options
            .AddJob<PrewarmDailyDistroJob>(builder => builder.WithIdentity(jobKey))
            .AddTrigger(builder =>
                builder
                    .ForJob(jobKey)
                    .WithIdentity($"{jobKey.Name}-trigger")
                    .WithCronSchedule("0 2 0 ? * *"));
    }
}
