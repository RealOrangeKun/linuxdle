using Linuxdle.Services.DailyPuzzles;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class DailyPuzzlesJob(
    IDailyPuzzleService dailyPuzzleService) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            await dailyPuzzleService.PrepareDailyPuzzle(context.CancellationToken);
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
