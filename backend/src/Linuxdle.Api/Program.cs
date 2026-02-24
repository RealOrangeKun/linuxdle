using System.Text.Json.Serialization;
using FluentValidation;
using HealthChecks.UI.Client;
using Linuxdle.Api.Configurations;
using Linuxdle.Api.Extensions;
using Linuxdle.Api.Health;
using Linuxdle.Infrastructure.Extensions;
using Linuxdle.Services.DailyDistros;
using Linuxdle.Services.DailyPuzzles;
using Linuxdle.Services.Extensions;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddOpenApi();

builder.Services.AddInternalServices();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.Configure<DailyPuzzleOptions>(
    builder.Configuration.GetSection(nameof(DailyPuzzleOptions)));

builder.Services.Configure<DistroImageOptions>(
    builder.Configuration.GetSection(nameof(DistroImageOptions)));

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

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapGroup("/api").MapAllEndpoints();

await app.RunAsync();
