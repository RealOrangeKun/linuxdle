using Linuxdle.Services.Users;
using Quartz;

namespace Linuxdle.Api.BackgroundJobs;

[DisallowConcurrentExecution]
internal sealed class CleanUsersJob(IUserService userService) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        await userService.CleanUnactiveUsers();
    }
}
