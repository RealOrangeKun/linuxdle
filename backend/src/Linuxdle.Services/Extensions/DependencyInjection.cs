using Linuxdle.Services.DailyCommands;
using Linuxdle.Services.DailyPuzzles;
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

            return services;
        }
    }
}
