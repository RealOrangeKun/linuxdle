using Linuxdle.Api.BackgroundJobs;
using Linuxdle.Api.Configurations;
using Linuxdle.Services.Configurations;
using Linuxdle.Services.DailyDistros;
using Linuxdle.Services.DailyPuzzles;
using Linuxdle.Services.Users;

namespace Linuxdle.Api.Extensions;

internal static class OptionsExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddOptionsConfiguration(IConfiguration configuration)
        {
            services.Configure<DailyPuzzleOptions>(
                configuration.GetSection(nameof(DailyPuzzleOptions)));

            services.Configure<DistroImageOptions>(
                configuration.GetSection(nameof(DistroImageOptions)));

            services.Configure<AccessTokenOptions>(
                configuration.GetSection(nameof(AccessTokenOptions)));

            services.Configure<RefreshTokenOptions>(
                configuration.GetSection(nameof(RefreshTokenOptions)));

            services.Configure<RegisterUserRateLimitOptions>(
                configuration.GetSection(nameof(RegisterUserRateLimitOptions)));

            services.Configure<GlobalRateLimitOptions>(
                configuration.GetSection(nameof(GlobalRateLimitOptions)));

            services.Configure<PrewarmDailyDistroJobOptions>(
                configuration.GetSection(nameof(PrewarmDailyDistroJobOptions)));

            services.Configure<PrewarmDailyDesktopEnvironmentJobOptions>(
                configuration.GetSection(nameof(PrewarmDailyDesktopEnvironmentJobOptions)));

            services.Configure<CleanUsersJobOptions>(
                configuration.GetSection(nameof(CleanUsersJobOptions)));

            services.Configure<GameSettings>(
                configuration.GetSection(nameof(GameSettings)));

            services.ConfigureOptions<ConfigureDailyPuzzleJob>();

            services.ConfigureOptions<ConfigureCleanUsersJob>();

            services.ConfigureOptions<ConfigurePrewarmDistroJob>();

            services.ConfigureOptions<ConfigurePrewarmDailyDesktopEnvironmentJob>();

            services.ConfigureOptions<ConfigureJwtOptions>();

            return services;
        }
    }
}
