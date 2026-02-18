using Microsoft.Extensions.DependencyInjection;

namespace Linuxdle.Services.Extensions;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInternalServices()
        {
            return services;
        }
    }
}
