using FluentValidation;

namespace Linuxdle.Api.Endpoints.DailyCommands.SubmitGuess;

internal sealed class SubmitDailyCommandRequestValidator : AbstractValidator<SubmitDailyCommandGuessRequest>
{
    public SubmitDailyCommandRequestValidator()
    {
        RuleFor(x => x.UserGuess)
            .NotEmpty()
            .WithMessage("User guess is required")
            .MaximumLength(100)
            .WithMessage("User guess must not exceed 100 characters");
    }
}