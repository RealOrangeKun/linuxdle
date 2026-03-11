using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyDistros;

public interface IDailyDistroService
{
    Task<DailyDistroGuessResultDto> HandleUserGuessAsync(Guid userId, string userGuess, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateDailyDistroLogoAsync(int numberOfTries, bool hardMode, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyDistroDto>> GetDailyDistrosAsync(CancellationToken cancellationToken = default);
    Task<DailyDistroDto?> GetYesterdaysTargetAsync(CancellationToken cancellationToken = default);
}
