using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyCommands;

public interface IDailyCommandService
{
    Task<DailyCommandGuessResultDto> HandleUserGuessAsync(Guid userId, string userGuess, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetDailyCommandsAsync(CancellationToken cancellationToken = default);
    Task<DailyCommandDto?> GetYesterdaysTargetAsync(CancellationToken cancellationToken = default);
    Task<DailyCommandGiveUpResultDto> HandleUserGiveUpAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<DailyCommandGuessResultDto> HandlePastGuessAsync(Guid userId, int puzzleId, string userGuess, CancellationToken cancellationToken = default);
    Task<DailyCommandGiveUpResultDto> HandlePastGiveUpAsync(Guid userId, int puzzleId, CancellationToken cancellationToken = default);
}



