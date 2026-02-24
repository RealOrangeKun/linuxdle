using Microsoft.AspNetCore.Mvc;

namespace Linuxdle.Api.Endpoints.DailyDistros.GetDailyDistroIcon;

internal sealed record GetDailyDistroIconRequest(
    [FromQuery(Name = "numberOfTries")] int NumberOfTries);
