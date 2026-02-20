using Linuxdle.Api.Endpoints;

namespace Linuxdle.Api.Extensions;

internal static class EndpointExtensions
{
    extension(IEndpointRouteBuilder app)
    {
        public IEndpointRouteBuilder MapAllEndpoints()
        {
            IEnumerable<Type> endpointTypes = typeof(Program).Assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract && typeof(IEndpoint).IsAssignableFrom(t));

            foreach (var endpointType in endpointTypes)
            {
                if (Activator.CreateInstance(endpointType) is IEndpoint instance)
                {
                    instance.MapEndpoint(app);
                }
            }

            return app;
        }
    }
}
