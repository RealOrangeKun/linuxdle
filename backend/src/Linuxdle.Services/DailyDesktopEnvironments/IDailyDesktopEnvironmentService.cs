using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyDesktopEnvironments;

public interface IDailyDesktopEnvironmentService
{
    Task<DailyDesktopEnvironmentGuessResultDto> HandleUserGuessAsync(string userGuess, int numberOfGuesses = 0, CancellationToken cancellationToken = default);
    Task<byte[]> GetDailyDesktopEnvironmentScreenshot(CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyDesktopEnvironmentDto>> GetDailyDesktopEnvironmentsAsync(CancellationToken cancellationToken = default);
}

