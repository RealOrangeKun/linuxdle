using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace Linuxdle.Services.DailyCommands;

internal sealed class DailyCommandService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache)
    : IDailyCommandService
{
    public async Task<GuessResultDto> HandleUserGuessAsync(string userGuess, int gameId, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await hybridCache.GetOrCreateAsync(
            $"daily_target_{today}",
            async cancel => await dbContext.DailyCommands
                .Include(c => c.Categories)
                .Where(c => dbContext.DailyPuzzles
                .Any(p => p.ScheduledDate == today && p.TargetId == c.Id))
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
            ?? throw new InvalidOperationException($"No daily puzzle found for {today:yyyy-MM-dd}");

        var guess = await hybridCache.GetOrCreateAsync(
            $"command_{userGuess.ToLower()}",
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
            ?? throw new InvalidOperationException($"Command '{userGuess}' not found");

        return GuessResultCalculator.CalculateResults(target, guess);
    }
    public async Task<IEnumerable<string>> GetDailyCommandsAsync(CancellationToken cancellationToken = default)
    {
        return await hybridCache.GetOrCreateAsync(
            "all_command_names",
            async cancel => await dbContext.DailyCommands
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => c.Name)
                .ToListAsync(cancellationToken: cancel),
            options: new HybridCacheEntryOptions { Expiration = TimeSpan.FromDays(7) },
            cancellationToken: cancellationToken
        );
    }
}
