using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace Linuxdle.Services.DailyDistros;

internal sealed class DailyDistroService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache)
    : IDailyDistroService
{
    public async Task<DailyDistroGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await hybridCache.GetOrCreateAsync(
            $"daily_distro_target_{today}", async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Where(dd => dbContext.DailyPuzzles
                .Any(dp => dp.ScheduledDate == today && dp.TargetId == dd.Id))
                .Select(dd => new { dd.Id })
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No daily puzzle found for {today:yyyy-MM-dd}");

        var guess = await hybridCache.GetOrCreateAsync(
            $"distro_{userGuess.ToLower()}",
            async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Where(dd => dd.Slug == userGuess.ToLower())
                .Select(dd => new { dd.Id })
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No Distro found for {userGuess}");

        return new(guess.Id == target.Id);
    }
}
