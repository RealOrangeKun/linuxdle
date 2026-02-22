using Linuxdle.Services.DailyPuzzles;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class DailyPuzzlesJob(
    IDailyPuzzleService dailyPuzzleService,
    ILogger<DailyPuzzlesJob> logger) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {

            logger.LogInformation("Job {Key} is being executed by Instance: {InstanceId}",
                context.JobDetail.Key,
                context.Scheduler.SchedulerInstanceId);

            await dailyPuzzleService.PrepareDailyPuzzle();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Job {JobKey} failed!", context.JobDetail.Key);

            var jobException = new JobExecutionException(ex)
            {
                RefireImmediately = true
            };

            throw jobException;
        }
    }
}
