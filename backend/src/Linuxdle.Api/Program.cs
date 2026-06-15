using System.Text.Json.Serialization;
using FluentValidation;
using HealthChecks.UI.Client;
using Linuxdle.Api.ExceptionHandlers;
using Linuxdle.Api.Extensions;
using Linuxdle.Api.Health;
using Linuxdle.Api.Middleware;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Infrastructure.Extensions;
using Linuxdle.Services.Extensions;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;

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

app.UseExceptionHandler();

app.UseRouting();

app.UseOpenTelemetryPrometheusScrapingEndpoint();

app.UseCors();

app.UseMiddleware<CountryRestrictionMiddleware>();

app.UseAuthentication();

app.UseAuthorization();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapGroup("/api").MapAllEndpoints();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LinuxdleDbContext>();
    int retries = 15;
    while (retries > 0)
    {
        try
        {
            await dbContext.Database.MigrateAsync();
            break;
        }
        catch (Exception ex)
        {
            retries--;
            if (retries == 0)
            {
                Console.WriteLine($"Database migration failed: {ex.Message}");
                throw;
            }
            Console.WriteLine($"Database not ready yet, retrying migration in 2 seconds... (Retries left: {retries})");
            await Task.Delay(2000);
        }
    }
}

await app.RunAsync();

public partial class Program { }
