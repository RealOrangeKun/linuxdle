using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.DailyDesktopEnvironments;

public interface IDailyDesktopEnvironmentService
{
    Task<DailyDesktopEnvironmentGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default);
    Task<byte[]> GetDailyDesktopEnvironmentScreenshot(CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyDesktopEnvironmentDto>> GetDailyDesktopEnvironmentsAsync(CancellationToken cancellationToken = default);
}
