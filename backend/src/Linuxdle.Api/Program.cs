using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FluentValidation;
using HealthChecks.UI.Client;
using Linuxdle.Api.Configurations;
using Linuxdle.Api.Extensions;
using Linuxdle.Api.Health;
using Linuxdle.Infrastructure.Extensions;
using Linuxdle.Services.DailyDistros;
using Linuxdle.Services.DailyPuzzles;
using Linuxdle.Services.Extensions;
using Linuxdle.Services.Users;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddOpenApi();

builder.Services.AddInternalServices();

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddOptionsConfiguration(builder.Configuration);

builder.Services.AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true);

var registerUserRateLimitOptions = builder.Configuration
    .GetSection(nameof(RegisterUserRateLimitOptions))
    .Get<RegisterUserRateLimitOptions>()!;

builder.Services.AddRateLimiter(options =>
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
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.ConfigureOptions<ConfigureDailyPuzzleJob>();

builder.Services.AddQuartzConfiguration(builder.Configuration);

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Database")!, name: "database", tags: ["ready"])
    .AddCheck<QuartzHealthCheck>("quartz", tags: ["ready"]);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Linuxdle API v1");
    });
}

app.UseRateLimiter();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapGroup("/api").MapAllEndpoints();

await app.RunAsync();
