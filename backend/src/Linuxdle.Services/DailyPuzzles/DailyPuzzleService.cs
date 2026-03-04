using Linuxdle.Domain.DailyPuzzles;
using Linuxdle.Domain.Games;
using Linuxdle.Infrastructure.Data;
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

        var games = await dbContext.Games
            .AsNoTracking()
            .ToListAsync(cancellationToken: cancellationToken);

        foreach (var game in games)
        {
            var existingDates = await dbContext.DailyPuzzles
                .AsNoTracking()
                .Where(p => p.GameId == game.Id && p.ScheduledDate >= today && p.ScheduledDate <= endDate)
                .Select(p => p.ScheduledDate)
                .ToHashSetAsync(cancellationToken);

            List<int> targetIds = await GetTargetIdsForGame(game.Id, cancellationToken);

            if (targetIds.Count == 0)
            {
                logger.LogWarning("No target IDs found for game {GameId}. Skipping scheduling.", game.Id);
                continue;
            }

            var random = new Random();
            var currentPointer = today;

            while (currentPointer <= endDate)
            {
                if (existingDates.Contains(currentPointer))
                {
                    currentPointer = currentPointer.AddDays(1);
                    continue;
                }

                int targetId = targetIds[random.Next(targetIds.Count)];

                await dbContext.DailyPuzzles.AddAsync(
                    DailyPuzzle.Create(game.Id, targetId, currentPointer),
                    cancellationToken);

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
                    cancellationToken: ct,
                    options: new HybridCacheEntryOptions { Expiration = TimeSpan.FromDays(14) }),
            GameIds.DailyDistros =>
                await hybridCache.GetOrCreateAsync($"{gameId}_target_ids",
                    async cancel => await dbContext.DailyDistros
                        .AsNoTracking()
                        .Select(dd => dd.Id)
                        .ToListAsync(cancel),
                    cancellationToken: ct,
                    options: new HybridCacheEntryOptions { Expiration = TimeSpan.FromDays(14) }),
            GameIds.DailyDesktopEnvironments =>
                await hybridCache.GetOrCreateAsync($"{gameId}_target_ids",
                    async cancel => await dbContext.DailyDesktopEnvironments
                        .AsNoTracking()
                        .Select(dd => dd.Id)
                        .ToListAsync(cancel),
                    cancellationToken: ct,
                    options: new HybridCacheEntryOptions { Expiration = TimeSpan.FromDays(14) }),
            _ => throw new ArgumentException($"Game mode {gameId} not implemented")
        };
    }
}
