using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyDistros;

public interface IDailyDistroService
{
    Task<DailyDistroGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateDailyDistroLogoAsync(int numberOfTries, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyDistroDto>> GetDailyDistrosAsync(CancellationToken cancellationToken = default);
}
