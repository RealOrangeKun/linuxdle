using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyDistros;

public interface IDailyDistroService
{
    Task<DailyDistroGuessResultDto> HandleUserGuessAsync(Guid userId, string userGuess, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateDailyDistroLogoAsync(int numberOfTries, bool hardMode, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyDistroDto>> GetDailyDistrosAsync(CancellationToken cancellationToken = default);
    Task<DailyDistroDto?> GetYesterdaysTargetAsync(CancellationToken cancellationToken = default);
    Task<DailyDistroDto> HandleUserGiveUpAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<DailyDistroGuessResultDto> HandlePastGuessAsync(Guid userId, int puzzleId, string userGuess, CancellationToken cancellationToken = default);
    Task<DailyDistroDto> HandlePastGiveUpAsync(Guid userId, int puzzleId, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePastDistroLogoAsync(int puzzleId, int numberOfTries, bool hardMode, CancellationToken cancellationToken = default);
}
