using Linuxdle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Linuxdle.Infrastructure.Extensions;

public static class DependencyInjection
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInfrastructure(IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString("Database") ?? throw new Exception();

            services.AddDbContext<LinuxdleDbContext>(options =>
                options.UseNpgsql(connectionString)
                    .UseSnakeCaseNamingConvention());

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis");
                options.InstanceName = "Linuxdle_";
            });

            services.AddHybridCache(options =>
            {
                options.MaximumPayloadBytes = configuration.GetValue<long>("HybridCache:MaximumPayloadBytes");
                options.MaximumKeyLength = configuration.GetValue<int>("HybridCache:MaximumKeyLength");
            });

            return services;
        }
    }
}
