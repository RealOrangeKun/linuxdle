using Linuxdle.Domain.Games;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace Linuxdle.Services.DailyDesktopEnvironments;

internal sealed class DailyDesktopEnvironmentService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache)
    : IDailyDesktopEnvironmentService
{
    public async Task<byte[]> GetDailyDesktopEnvironmentScreenshot(CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await hybridCache.GetOrCreateAsync(
            $"daily_de_target_{today}", async cancel => await dbContext.DailyDesktopEnvironments
                .AsNoTracking()
                .Include(dde => dde.DesktopEnvironmentScreenshots)
                .Where(dde => dbContext.DailyPuzzles
                .Any(dp => dp.ScheduledDate == today && dp.TargetId == dde.Id && dp.GameId == GameIds.DailyDesktopEnvironments))
                .Select(dde => new DailyDesktopEnvironmentTargetDto(
                    dde.Id,
                    dde.DesktopEnvironmentScreenshots.Select(s => new DesktopEnvironmentScreenshotDto(
                        s.Id,
                        s.FilePath,
                        s.Credit
                    )).ToList()
                ))
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No daily puzzle found for {today:yyyy-MM-dd}");

        var screenshots = target.Screenshots.ToList();

        if (screenshots.Count == 0)
        {
            throw new InvalidOperationException($"No screenshots available for daily puzzle on {today:yyyy-MM-dd}");
        }

        var dayOfYear = today.DayOfYear;
        var selectedScreenshot = screenshots[dayOfYear % screenshots.Count];

        var screenshotBytes = await File.ReadAllBytesAsync(selectedScreenshot.FilePath, cancellationToken);
        return screenshotBytes;
    }

    public async Task<DailyDesktopEnvironmentGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await hybridCache.GetOrCreateAsync(
            $"daily_de_target_{today}", async cancel => await dbContext.DailyDesktopEnvironments
                .AsNoTracking()
                .Where(dde => dbContext.DailyPuzzles
                .Any(dp => dp.ScheduledDate == today && dp.TargetId == dde.Id && dp.GameId == GameIds.DailyDesktopEnvironments))
                .Select(dd => new { dd.Id })
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No daily puzzle found for {today:yyyy-MM-dd}");

        var guess = await hybridCache.GetOrCreateAsync(
            $"de_{userGuess.ToLower()}",
            async cancel => await dbContext.DailyDesktopEnvironments
                .AsNoTracking()
                .Where(dde => dde.Slug == userGuess.ToLower())
                .Select(dd => new { dd.Id })
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No Distro found for {userGuess}");

        return new(guess.Id == target.Id);
    }
}
