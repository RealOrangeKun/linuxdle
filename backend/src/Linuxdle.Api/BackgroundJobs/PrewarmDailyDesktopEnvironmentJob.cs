using Linuxdle.Services.DailyDesktopEnvironments;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class PrewarmDailyDesktopEnvironmentJob(
    IDailyDesktopEnvironmentService dailyDesktopEnvironmentService) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        await dailyDesktopEnvironmentService.GetDailyDesktopEnvironmentScreenshot(context.CancellationToken);
    }
}
