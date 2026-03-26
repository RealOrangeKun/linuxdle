using Linuxdle.Services.DailyPuzzles;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class DailyPuzzlesJob(
    IDailyPuzzleService dailyPuzzleService) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        await dailyPuzzleService.PrepareDailyPuzzle(context.CancellationToken);
    }
}
