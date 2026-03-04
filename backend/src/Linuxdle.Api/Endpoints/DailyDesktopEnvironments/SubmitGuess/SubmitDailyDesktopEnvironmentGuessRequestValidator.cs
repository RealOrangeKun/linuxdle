using FluentValidation;

namespace Linuxdle.Api.Endpoints.DailyDesktopEnvironments.SubmitGuess;

internal sealed class SubmitDailyDesktopEnvironmentGuessRequestValidator : AbstractValidator<SubmitDailyDesktopEnvironmentGuessRequest>
{
    public SubmitDailyDesktopEnvironmentGuessRequestValidator()
    {
        RuleFor(x => x.UserGuess)
            .NotEmpty()
            .WithMessage("User guess is required")
            .MaximumLength(100)
            .WithMessage("User guess must not exceed 100 characters");
    }
}
