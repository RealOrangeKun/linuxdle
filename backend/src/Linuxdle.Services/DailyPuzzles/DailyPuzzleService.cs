using Linuxdle.Domain.DailyPuzzles;
using Linuxdle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Linuxdle.Services.DailyPuzzles;

internal sealed class DailyPuzzleService(
    LinuxdleDbContext dbContext,
    IOptions<DailyPuzzleOptions> options)
    : IDailyPuzzleService
{
    public async Task PrepareDailyPuzzle(CancellationToken cancellationToken = default)
    {
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = startDate.AddDays(options.Value.DaysToSchedule);

        var games = await dbContext.Games
            .AsNoTracking()
            .ToListAsync(cancellationToken: cancellationToken);

        foreach (var game in games)
        {
            var lastScheduledDate = await dbContext.DailyPuzzles
                .AsNoTracking()
                .Where(p => p.GameId == game.Id)
                .OrderByDescending(p => p.ScheduledDate)
                .Select(p => p.ScheduledDate)
                .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            var currentPointer = lastScheduledDate > startDate ? lastScheduledDate.AddDays(1) : startDate;

            List<int> targetIds = await GetTargetIdsForGame(game.Id, cancellationToken);
            var random = new Random();

            while (currentPointer <= endDate)
            {
                if (await dbContext.DailyPuzzles.AnyAsync(p => p.ScheduledDate == currentPointer && p.GameId == game.Id, cancellationToken: cancellationToken))
                {
                    currentPointer = currentPointer.AddDays(1);
                    continue;
                }

                int targetId = targetIds[random.Next(targetIds.Count)];

                await dbContext.DailyPuzzles
                    .AddAsync(
                        DailyPuzzle.Create(
                            game.Id,
                            targetId,
                            currentPointer),
                        cancellationToken);

                currentPointer = currentPointer.AddDays(1);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<List<int>> GetTargetIdsForGame(int gameId, CancellationToken ct)
    {
        return gameId switch
        {
            1 => await dbContext.DailyCommands.Select(dc => dc.Id).ToListAsync(ct),
            _ => throw new ArgumentException($"Game mode {gameId} not implemented")
        };
    }
}
