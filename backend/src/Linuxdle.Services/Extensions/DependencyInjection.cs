using Linuxdle.Services.DailyCommands;
using Linuxdle.Services.DailyDesktopEnvironments;
using Linuxdle.Services.DailyDistros;
using Linuxdle.Services.DailyPuzzles;
using Linuxdle.Services.Users;
using Microsoft.Extensions.DependencyInjection;

namespace Linuxdle.Services.Extensions;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInternalServices()
        {
            services.AddScoped<IDailyCommandService, DailyCommandService>();

            services.AddScoped<IDailyPuzzleService, DailyPuzzleService>();

            services.AddScoped<IDailyDistroService, DailyDistroService>();

            services.AddScoped<IUserService, UserService>();

            services.AddScoped<IUserStreakService, UserStreakService>();

            services.AddScoped<IDailyDesktopEnvironmentService, DailyDesktopEnvironmentService>();

            return services;
        }
    }
}
