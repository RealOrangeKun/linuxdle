using Quartz;

namespace Linuxdle.Api.BackgroundJobs.Listeners;

internal sealed class LoggingJobListener(
    ILogger<LoggingJobListener> logger)
    : IJobListener
{
    public string Name => nameof(LoggingJobListener);

    public Task JobExecutionVetoed(IJobExecutionContext context, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("START: Job {Key} on Instance {Id}",
            context.JobDetail.Key, context.Scheduler.SchedulerInstanceId);
        return Task.CompletedTask;
    }

    public Task JobToBeExecuted(IJobExecutionContext context, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("START: Job {Key}", context.JobDetail.Key);
        return Task.CompletedTask;
    }

    public Task JobWasExecuted(IJobExecutionContext context, JobExecutionException? jobException, CancellationToken cancellationToken = default)
    {
        if (jobException is not null)
        {
            logger.LogError(jobException, "FAIL: Job {Key}", context.JobDetail.Key);
        }
        else
        {
            logger.LogInformation("SUCCESS: Job {Key}", context.JobDetail.Key);
        }
        return Task.CompletedTask;
    }
}
