using Linuxdle.Services.DailyDesktopEnvironments;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class PrewarmDailyDesktopEnvironmentJob(
    IDailyDesktopEnvironmentService dailyDesktopEnvironmentService) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            await dailyDesktopEnvironmentService.GetDailyDesktopEnvironmentScreenshot(context.CancellationToken);
        }
        catch (Exception)
        {
            throw;
        }
    }
}
