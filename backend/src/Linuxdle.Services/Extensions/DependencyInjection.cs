using Linuxdle.Services.DailyCommands;
using Microsoft.Extensions.DependencyInjection;

namespace Linuxdle.Services.Extensions;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInternalServices()
        {
            services.AddScoped<IDailyCommandService, DailyCommandService>();

            return services;
        }
    }
}
