using Linuxdle.Api.BackgroundJobs;
using Linuxdle.Services.DailyPuzzles;
using Microsoft.Extensions.Options;
using Quartz;

namespace Linuxdle.Api.Configurations;

internal sealed class ConfigureDailyPuzzleJob(IOptions<DailyPuzzleOptions> options)
    : IConfigureOptions<QuartzOptions>
{
    private readonly DailyPuzzleOptions _options = options.Value;

    public void Configure(QuartzOptions options)
    {
        var jobKey = new JobKey(nameof(DailyPuzzlesJob));

        options
            .AddJob<DailyPuzzlesJob>(builder => builder.WithIdentity(jobKey))
            .AddTrigger(builder =>
                builder
                    .ForJob(jobKey)
                    .WithIdentity($"{jobKey.Name}-trigger")
                    // .WithCronSchedule(_options.CronSchedule)
                    .WithSimpleSchedule(s => s.WithIntervalInSeconds(10).RepeatForever()));
    }
}