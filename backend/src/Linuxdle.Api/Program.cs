using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FluentValidation;
using HealthChecks.UI.Client;
using Linuxdle.Api.Configurations;
using Linuxdle.Api.Extensions;
using Linuxdle.Api.Health;
using Linuxdle.Infrastructure.Extensions;
using Linuxdle.Services.Extensions;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

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

builder.Services.ConfigureOptions<ConfigureJwtOptions>();

builder.Services.AddQuartzConfiguration(builder.Configuration);

builder.Services.AddAuthentication().AddJwtBearer();

builder.Services.AddAuthorization();

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

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.UseRateLimiter();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapGroup("/api").MapAllEndpoints();

await app.RunAsync();
