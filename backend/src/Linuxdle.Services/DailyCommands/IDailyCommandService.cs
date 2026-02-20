using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyCommands;

public interface IDailyCommandService
{
    Task<GuessResultDto> HandleUserGuess(string userGuess, int gameId, CancellationToken cancellationToken = default);
}


