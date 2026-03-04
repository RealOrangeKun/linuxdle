using FluentValidation;

namespace Linuxdle.Api.Endpoints.DailyDistros.SubmitGuess;

internal sealed class SubmitDailyDistroGuessRequestValidator : AbstractValidator<SubmitDailyDistroGuessRequest>
{
    public SubmitDailyDistroGuessRequestValidator()
    {
        RuleFor(x => x.UserGuess)
            .NotEmpty()
            .WithMessage("User guess is required")
            .MaximumLength(100)
            .WithMessage("User guess must not exceed 100 characters");
    }
}
