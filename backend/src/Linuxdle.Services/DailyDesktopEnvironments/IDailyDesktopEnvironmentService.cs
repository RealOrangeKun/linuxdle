using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyDesktopEnvironments;

public interface IDailyDesktopEnvironmentService
{
    Task<DailyDesktopEnvironmentGuessResultDto> HandleUserGuessAsync(Guid userId, string userGuess, int numberOfGuesses = 0, CancellationToken cancellationToken = default);
    Task<byte[]> GetDailyDesktopEnvironmentScreenshot(CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyDesktopEnvironmentDto>> GetDailyDesktopEnvironmentsAsync(CancellationToken cancellationToken = default);
    Task<DailyDesktopEnvironmentDto?> GetYesterdaysTargetAsync(CancellationToken cancellationToken = default);
    Task<DailyDesktopEnvironmentDto> HandleUserGiveUpAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<DailyDesktopEnvironmentGuessResultDto> HandlePastGuessAsync(Guid userId, int puzzleId, string userGuess, int numberOfGuesses, CancellationToken cancellationToken = default);
    Task<DailyDesktopEnvironmentDto> HandlePastGiveUpAsync(Guid userId, int puzzleId, CancellationToken cancellationToken = default);
    Task<byte[]> GetPastDesktopEnvironmentScreenshotAsync(int puzzleId, CancellationToken cancellationToken = default);
}

