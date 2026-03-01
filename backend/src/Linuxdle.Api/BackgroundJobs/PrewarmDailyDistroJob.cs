using Linuxdle.Services.DailyDistros;
using Microsoft.Extensions.Options;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class PrewarmDailyDistroJob(
    IDailyDistroService dailyDistroService,
    IOptions<DistroImageOptions> distroImageOptions) : IJob
{
    private readonly DistroImageOptions _distroImageOptions = distroImageOptions.Value;

    public async Task Execute(IJobExecutionContext context)
    {
        foreach (var hardMode in (bool[])[false, true])
        {
            for (int tries = 1; tries <= _distroImageOptions.MaxRetries; tries++)
            {
                try
                {
                    await dailyDistroService.GenerateDailyDistroLogoAsync(
                        tries,
                        hardMode,
                        context.CancellationToken);
                }
                catch (Exception ex)
                {
                    var jobException = new JobExecutionException(ex)
                    {
                        RefireImmediately = true
                    };

                    throw jobException;
                }
            }
        }
    }
}
