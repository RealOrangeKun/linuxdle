using System.Threading.RateLimiting;
using Linuxdle.Api.Configurations;

namespace Linuxdle.Api.Extensions
{
    public static class RateLimiterExtensions
    {
        public static IServiceCollection AddRateLimiting(this IServiceCollection services, IConfiguration configuration)
        {
            var registerUserRateLimitOptions = configuration
                .GetSection(nameof(RegisterUserRateLimitOptions))
                .Get<RegisterUserRateLimitOptions>()!;

            var globalRateLimitOptions = configuration
                .GetSection(nameof(GlobalRateLimitOptions))
                .Get<GlobalRateLimitOptions>()!;

            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy("registerUser", context =>
                    RateLimitPartition.GetSlidingWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new SlidingWindowRateLimiterOptions
                        {
                            PermitLimit = registerUserRateLimitOptions.PermitLimit,
                            Window = TimeSpan.FromSeconds(registerUserRateLimitOptions.WindowInSeconds),
                            QueueLimit = registerUserRateLimitOptions.QueueLimit,
                            SegmentsPerWindow = 2
                        }));

                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: partitionKey,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = globalRateLimitOptions.AutoReplenishment,
                            PermitLimit = globalRateLimitOptions.PermitLimit,
                            Window = TimeSpan.FromSeconds(globalRateLimitOptions.WindowInSeconds),
                            QueueLimit = globalRateLimitOptions.QueueLimit
                        });
                });
            });

            return services;
        }
    }
}
