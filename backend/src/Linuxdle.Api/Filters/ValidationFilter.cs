using FluentValidation;

namespace Linuxdle.Api.Filters;

internal sealed class ValidationFilter<T>(IValidator<T> validator) : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        if (context.Arguments.FirstOrDefault(x => x is T) is not T arg) return Results.BadRequest("Invalid request body.");

        var result = await validator.ValidateAsync(arg);
        if (!result.IsValid) return Results.ValidationProblem(result.ToDictionary());

        return await next(context);
    }
}
