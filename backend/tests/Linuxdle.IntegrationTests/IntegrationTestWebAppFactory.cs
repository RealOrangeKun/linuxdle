using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Testcontainers.PostgreSql;
using Testcontainers.Redis;
using Xunit;
using Microsoft.EntityFrameworkCore;
using Linuxdle.Infrastructure.Data;

namespace Linuxdle.IntegrationTests;

public class IntegrationTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres;
    private readonly RedisContainer _redis;

    public IntegrationTestWebAppFactory()
    {
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:15-alpine")
            .Build();

        _redis = new RedisBuilder()
            .WithImage("redis:7-alpine")
            .Build();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Override connection strings properly after containers start
        builder.UseSetting("ConnectionStrings:Database", _postgres.GetConnectionString());
        builder.UseSetting("ConnectionStrings:Redis", _redis.GetConnectionString());

        builder.ConfigureTestServices(services =>
        {
            var hostedServiceDescriptors = services.Where(d =>
                d.ServiceType == typeof(IHostedService) &&
                d.ImplementationType?.Name == "QuartzHostedService").ToList();

            foreach (var descriptor in hostedServiceDescriptors)
            {
                services.Remove(descriptor);
            }
        });
    }

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await _redis.StartAsync();

        // Migrate once for this factory instance
        using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<LinuxdleDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    public new async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
        await _redis.DisposeAsync();
    }
}
