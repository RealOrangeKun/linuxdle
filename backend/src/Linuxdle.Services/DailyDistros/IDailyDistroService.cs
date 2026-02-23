using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyDistros;

public interface IDailyDistroService
{
    Task<DailyDistroGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default);
}
