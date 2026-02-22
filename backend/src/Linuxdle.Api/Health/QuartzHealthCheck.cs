using Microsoft.Extensions.Diagnostics.HealthChecks;
using Quartz;

namespace Linuxdle.Api.Health;

internal sealed class QuartzHealthCheck(ISchedulerFactory schedulerFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var scheduler = await schedulerFactory.GetScheduler(cancellationToken);

            if (scheduler.IsStarted && !scheduler.IsShutdown)
            {
                return HealthCheckResult.Healthy("Quartz scheduler is running and heartbeating.");
            }

            return HealthCheckResult.Unhealthy("Quartz scheduler is not running.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Quartz health check failed", ex);
        }
    }
}
