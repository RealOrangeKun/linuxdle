using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;

namespace Linuxdle.Api.Extensions;

internal static class OpenTelemetryExtensions
{
    extension(IServiceCollection services)
    {
        public void AddOpenTelemetry(IConfiguration configuration)
        {
            var lokiEndpoint = configuration["OpenTelemetry:LokiEndpoint"]
                ?? throw new InvalidOperationException("OpenTelemetry:LokiEndpoint configuration is required");

            // Metrics for Prometheus - container & application health
            services.AddOpenTelemetry()
                .ConfigureResource(resource => resource
                    .AddService(
                        serviceName: "linuxdle-backend",
                        serviceVersion: "1.0.0",
                        serviceInstanceId: Environment.MachineName))
                .WithMetrics(metrics => metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddProcessInstrumentation()
                    .AddPrometheusExporter());

            // Logging to Loki - application logs
            services.AddLogging(logging =>
            {
                logging.AddOpenTelemetry(options =>
                {
                    options.SetResourceBuilder(ResourceBuilder.CreateDefault()
                        .AddService(
                            serviceName: "linuxdle-backend",
                            serviceVersion: "1.0.0",
                            serviceInstanceId: Environment.MachineName));

                    options.IncludeFormattedMessage = true;
                    options.IncludeScopes = true;
                    options.ParseStateValues = true;

                    options.AddOtlpExporter(otlpOptions =>
                    {
                        otlpOptions.Endpoint = new Uri(lokiEndpoint);
                        otlpOptions.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf;
                    });
                });
            });
        }
    }
}
