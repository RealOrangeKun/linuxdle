using Linuxdle.Services.Users;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class CleanUsersJob(IUserService userService) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            await userService.CleanUnactiveUsers();
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
