using Linuxdle.Domain.DailyPuzzles;
using Linuxdle.Domain.Games;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Common.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Linuxdle.Services.DailyPuzzles;

internal sealed class DailyPuzzleService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache,
    IOptions<DailyPuzzleOptions> puzzleOptions,
    ILogger<DailyPuzzleService> logger)
    : IDailyPuzzleService
{
    public async Task PrepareDailyPuzzle(CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = today.AddDays(puzzleOptions.Value.DaysToSchedule);

        var gameIds = await hybridCache.GetOrCreateAsync(
            CacheKeys.AllGameIds,
            async cancel =>
                await dbContext.Games
                    .AsNoTracking()
                    .Select(g => g.Id)
                    .ToListAsync(cancel),
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
            cancellationToken: cancellationToken);

        foreach (var gameId in gameIds)
        {
            var existingDates = await dbContext.DailyPuzzles
                .AsNoTracking()
                .Where(p => p.GameId == gameId && p.ScheduledDate >= today.AddDays(-1))
                .Select(p => p.ScheduledDate)
                .ToHashSetAsync(cancellationToken);

            List<int> allTargetIds = await GetTargetIdsForGame(gameId, cancellationToken);

            if (allTargetIds.Count == 0)
            {
                logger.LogWarning("No target IDs found for game {GameId}. Skipping scheduling.", gameId);
                continue;
            }

            int historyLimit = Math.Min(30, allTargetIds.Count / 2);
            var recentlyUsedIds = await dbContext.DailyPuzzles
                .AsNoTracking()
                .Where(p => p.GameId == gameId)
                .OrderByDescending(p => p.ScheduledDate)
                .Select(p => p.TargetId)
                .Take(historyLimit)
                .ToHashSetAsync(cancellationToken);

            var availableIds = allTargetIds.Where(id => !recentlyUsedIds.Contains(id)).ToList();
            if (availableIds.Count == 0) availableIds = allTargetIds;

            var random = new Random();
            var currentPointer = today;

            while (currentPointer <= endDate)
            {
                if (existingDates.Contains(currentPointer))
                {
                    currentPointer = currentPointer.AddDays(1);
                    continue;
                }

                int targetId = availableIds[random.Next(availableIds.Count)];

                dbContext.DailyPuzzles.Add(
                    DailyPuzzle.Create(gameId, targetId, currentPointer));

                recentlyUsedIds.Add(targetId);
                availableIds.Remove(targetId);

                if (availableIds.Count == 0) availableIds = [.. allTargetIds];

                existingDates.Add(currentPointer);
                currentPointer = currentPointer.AddDays(1);
            }
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Conflict during DailyPuzzle generation. Unique constraint violated.");
            throw;
        }
    }

    private async Task<List<int>> GetTargetIdsForGame(int gameId, CancellationToken ct)
    {
        return gameId switch
        {
            GameIds.DailyCommands =>
                await hybridCache.GetOrCreateAsync($"{gameId}_target_ids",
                    async cancel => await dbContext.DailyCommands
                        .AsNoTracking()
                        .Select(dc => dc.Id)
                        .ToListAsync(cancel),
                    options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
                    cancellationToken: ct),
            GameIds.DailyDistros =>
                await hybridCache.GetOrCreateAsync($"{gameId}_target_ids",
                    async cancel => await dbContext.DailyDistros
                        .AsNoTracking()
                        .Select(dd => dd.Id)
                        .ToListAsync(cancel),
                    options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
                    cancellationToken: ct),
            GameIds.DailyDesktopEnvironments =>
                await hybridCache.GetOrCreateAsync($"{gameId}_target_ids",
                    async cancel => await dbContext.DailyDesktopEnvironments
                        .AsNoTracking()
                        .Select(dd => dd.Id)
                        .ToListAsync(cancel),
                    options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
                    cancellationToken: ct),
            _ => throw new ArgumentException($"Game mode {gameId} not implemented")
        };
    }
}
