using Linuxdle.Domain.Exceptions;
using Linuxdle.Domain.Games;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Common.Constants;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace Linuxdle.Services.DailyCommands;

internal sealed class DailyCommandService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache)
    : IDailyCommandService
{
    public async Task<DailyCommandGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await GetDailyTargetAsync(today, cancellationToken);

        var guess = await hybridCache.GetOrCreateAsync(
            CacheKeys.CommandByName(userGuess),
            async cancel => await dbContext.DailyCommands
                .Include(c => c.Categories)
                .Where(c => c.Name.ToLower() == userGuess.ToLower())
                .Select(c => new DailyCommandDto(
                    c.Id,
                    c.Name,
                    c.Package,
                    c.OriginYear,
                    c.ManSection,
                    c.IsBuiltIn,
                    c.RequiresArgs,
                    c.IsPosix,
                    c.Categories.Select(cat => cat.Id).ToHashSet(),
                    c.Categories.Select(cat => cat.Name).ToList()
                ))
                .AsNoTracking()
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Command '{userGuess}' not found");

        return DailyCommandGuessResultCalculator.CalculateResults(target, guess);
    }
    public async Task<IEnumerable<string>> GetDailyCommandsAsync(CancellationToken cancellationToken = default)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.AllCommandNames,
            async cancel => await dbContext.DailyCommands
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => c.Name)
                .ToListAsync(cancellationToken: cancel),
            options: new HybridCacheEntryOptions { Expiration = TimeSpan.FromDays(7) },
            cancellationToken: cancellationToken
        );
    }
    private async Task<DailyCommandDto> GetDailyTargetAsync(DateOnly today, CancellationToken cancellationToken)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyCommandTarget(today),
            async cancel =>
            {
                var targetId = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyCommands && p.ScheduledDate == today)
                    .Select(p => p.TargetId)
                    .FirstOrDefaultAsync(cancel);

                if (targetId == default) return null;

                return await dbContext.DailyCommands
                    .Include(c => c.Categories)
                    .Where(c => c.Id == targetId)
                    .Select(c => new DailyCommandDto(
                        c.Id,
                        c.Name,
                        c.Package,
                        c.OriginYear,
                        c.ManSection,
                        c.IsBuiltIn,
                        c.RequiresArgs,
                        c.IsPosix,
                        c.Categories.Select(cat => cat.Id).ToHashSet(),
                        c.Categories.Select(cat => cat.Name).ToList()
                    ))
                    .AsNoTracking()
                    .FirstOrDefaultAsync(cancel);
            },
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"No daily puzzle found for {today:yyyy-MM-dd}");
    }
}
