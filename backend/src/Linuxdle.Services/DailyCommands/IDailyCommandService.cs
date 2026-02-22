using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyCommands;

public interface IDailyCommandService
{
    Task<GuessResultDto> HandleUserGuessAsync(string userGuess, int gameId, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetDailyCommandsAsync(CancellationToken cancellationToken = default);
}


