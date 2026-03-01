using Linuxdle.Api.BackgroundJobs.Listeners;
using Quartz;

namespace Linuxdle.Api.Extensions;

internal static class QuartzExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddQuartzConfiguration(IConfiguration configuration)
        {
            services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

            services.AddQuartz(q =>
            {
                q.SchedulerId = "AUTO";

                q.UsePersistentStore(s =>
                {
                    s.UsePostgres(postgres =>
                    {
                        postgres.ConnectionString = configuration.GetConnectionString("Database")!;
                    });

                    s.UseNewtonsoftJsonSerializer();

                    s.UseClustering(c =>
                    {
                        c.CheckinInterval = TimeSpan.FromSeconds(20);
                        c.CheckinMisfireThreshold = TimeSpan.FromSeconds(60);
                    });
                });

                q.AddJobListener<LoggingJobListener>();
            });

            return services;
        }
    }
}
