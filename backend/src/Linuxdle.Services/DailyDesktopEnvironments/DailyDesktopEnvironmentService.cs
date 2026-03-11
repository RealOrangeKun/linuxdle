using Linuxdle.Domain.Games;
using Linuxdle.Domain.UserGuesses;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Common.Constants;
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

        var (_, target) = await GetDailyTargetAsync(today, cancellationToken);

        var screenshots = target.Screenshots.ToList();

        if (screenshots.Count == 0)
        {
            throw new InvalidOperationException($"No screenshots available for daily puzzle on {today:yyyy-MM-dd}");
        }

        var dayOfYear = today.DayOfYear;
        var selectedScreenshot = screenshots[dayOfYear % screenshots.Count];

        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDesktopEnvironmentScreenshot(selectedScreenshot.Id),
            async cancel => await File.ReadAllBytesAsync(selectedScreenshot.FilePath, cancel),
            cancellationToken: cancellationToken
        );
    }

    public async Task<DailyDesktopEnvironmentGuessResultDto> HandleUserGuessAsync(Guid userId, string userGuess, int numberOfGuesses = 0, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var (puzzleId, target) = await GetDailyTargetAsync(today, cancellationToken);

        var guess = await hybridCache.GetOrCreateAsync(
            CacheKeys.DesktopEnvironmentBySlug(userGuess),
            async cancel => await dbContext.DailyDesktopEnvironments
                .AsNoTracking()
                .Where(dde => dde.Slug == userGuess.ToLower())
                .Select(dd => new { dd.Id })
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No Distro found for {userGuess}");

        var isCorrect = guess.Id == target.Id;

        dbContext.UserGuesses.Add(UserGuess.Create(userId, puzzleId, GameIds.DailyDesktopEnvironments, today, target.Id, isCorrect));
        await dbContext.SaveChangesAsync(cancellationToken);

        return new DailyDesktopEnvironmentGuessResultDto(
            IsCorrect: isCorrect,
            Family: numberOfGuesses >= 2 ? target.Family : null,
            ConfigurationLanguage: numberOfGuesses >= 4 ? target.ConfigurationLanguage : null,
            ReleaseYear: numberOfGuesses >= 6 ? target.ReleaseYear : null,
            PrimaryLanguage: numberOfGuesses >= 8 ? target.PrimaryLanguage : null
        );
    }


    private async Task<(int PuzzleId, DailyDesktopEnvironmentTargetDto Target)> GetDailyTargetAsync(DateOnly today, CancellationToken cancellationToken)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDesktopEnvironmentTarget(today),
            async cancel =>
            {
                var puzzle = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyDesktopEnvironments && p.ScheduledDate == today)
                    .Select(p => new { p.Id, p.TargetId })
                    .FirstOrDefaultAsync(cancel);

                if (puzzle == null) return null;

                var target = await dbContext.DailyDesktopEnvironments
                    .AsNoTracking()
                    .Include(dde => dde.DesktopEnvironmentScreenshots)
                    .Where(dde => dde.Id == puzzle.TargetId)
                    .Select(dde => new DailyDesktopEnvironmentTargetDto(
                        dde.Id,
                        dde.Family,
                        dde.ConfigurationLanguage,
                        dde.ReleaseYear,
                        dde.PrimaryLanguage,
                        dde.DesktopEnvironmentScreenshots.Select(s => new DesktopEnvironmentScreenshotDto(
                            s.Id,
                            s.FilePath,
                            s.Credit
                        )).ToList()
                    ))
                    .FirstOrDefaultAsync(cancel);

                return target != null ? (puzzle.Id, target) : ((int, DailyDesktopEnvironmentTargetDto)?)null;
            },
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No daily puzzle found for {today:yyyy-MM-dd}");
    }

    public async Task<IEnumerable<DailyDesktopEnvironmentDto>> GetDailyDesktopEnvironmentsAsync(CancellationToken cancellationToken = default)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.AllDesktopEnvironments,
            async cancel => await dbContext.DailyDesktopEnvironments
                .AsNoTracking()
                .Select(dde => new DailyDesktopEnvironmentDto(dde.Name, dde.Slug))
                .ToListAsync(cancel),
            cancellationToken: cancellationToken
        );
    }

    public async Task<DailyDesktopEnvironmentDto?> GetYesterdaysTargetAsync(CancellationToken cancellationToken = default)
    {
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);

        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDesktopEnvironmentTarget(yesterday),
            async cancel =>
            {
                var targetId = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyDesktopEnvironments && p.ScheduledDate == yesterday)
                    .Select(p => p.TargetId)
                    .FirstOrDefaultAsync(cancel);

                if (targetId == default) return null;

                return await dbContext.DailyDesktopEnvironments
                    .AsNoTracking()
                    .Where(dde => dde.Id == targetId)
                    .Select(dde => new DailyDesktopEnvironmentDto(dde.Name, dde.Slug))
                    .FirstOrDefaultAsync(cancel);
            },
            cancellationToken: cancellationToken);
    }
}
