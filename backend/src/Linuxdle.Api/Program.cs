using System.Text.Json.Serialization;
using FluentValidation;
using HealthChecks.UI.Client;
using Linuxdle.Api.ExceptionHandlers;
using Linuxdle.Api.Extensions;
using Linuxdle.Api.Health;
using Linuxdle.Infrastructure.Extensions;
using Linuxdle.Services.Extensions;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddOpenApi();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddInternalServices();

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddOptionsConfiguration(builder.Configuration);

builder.Services.AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true);

builder.Services.AddRateLimiting(builder.Configuration);

builder.Services.AddOpenTelemetry(builder.Configuration);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddQuartzConfiguration(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

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

app.UseOpenTelemetryPrometheusScrapingEndpoint();

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

app.UseRateLimiter();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapGroup("/api").MapAllEndpoints();

await app.RunAsync();
