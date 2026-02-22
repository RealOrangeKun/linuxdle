namespace Linuxdle.Api.Endpoints.DailyCommands.SubmitGuess;

internal sealed partial class SubmitDailyCommandGuessEndpoint
{
    public sealed record SubmitDailyCommandGuessRequest(string UserGuess, int GameId);
}