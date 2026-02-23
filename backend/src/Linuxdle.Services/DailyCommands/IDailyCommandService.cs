using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyCommands;

public interface IDailyCommandService
{
    Task<DailyCommandGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetDailyCommandsAsync(CancellationToken cancellationToken = default);
}


