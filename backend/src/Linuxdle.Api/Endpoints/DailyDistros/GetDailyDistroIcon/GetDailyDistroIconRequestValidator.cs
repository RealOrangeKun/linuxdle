using FluentValidation;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistroIcon;

internal sealed class GetDailyDistroIconRequestValidator : AbstractValidator<GetDailyDistroIconRequest>
{
    public GetDailyDistroIconRequestValidator()
    {
        RuleFor(x => x.NumberOfTries)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Number of tries must be at least 1");
    }
}
