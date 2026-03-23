using Linuxdle.Domain.Exceptions;
using Linuxdle.Domain.Games;
using Linuxdle.Domain.UserGuesses;
using Linuxdle.Domain.UserGiveUps;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Common.Constants;
using Linuxdle.Services.Configurations;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Options;

namespace Linuxdle.Services.DailyCommands;

internal sealed class DailyCommandService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache,
    IOptions<GameSettings> gameSettings)
    : IDailyCommandService
{
    public async Task<DailyCommandGuessResultDto> HandleUserGuessAsync(Guid userId, string userGuess, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var (puzzleId, target) = await GetDailyTargetAsync(today, cancellationToken);
        
        bool hasGivenUp = await dbContext.UserGiveUps
            .AnyAsync(ug => ug.UserId == userId && ug.PuzzleId == puzzleId && ug.Date == today, cancellationToken);
            
        if (hasGivenUp)
            throw new BadRequestException("You have already given up today.");

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
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Command '{userGuess}' not found");

        var result = DailyCommandGuessResultCalculator.CalculateResults(target, guess);
        var isCorrect = result.MatchResults.IsCorrect;

        dbContext.UserGuesses.Add(UserGuess.Create(userId, puzzleId, GameIds.DailyCommands, today, target.Id, isCorrect));
        await dbContext.SaveChangesAsync(cancellationToken);

        return result;
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
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
            cancellationToken: cancellationToken
        );
    }
    private async Task<(int PuzzleId, DailyCommandDto Target)> GetDailyTargetAsync(DateOnly today, CancellationToken cancellationToken)
    {
        var cachedTarget = await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyCommandTarget(today),
            async cancel =>
            {
                var puzzle = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyCommands && p.ScheduledDate == today)
                    .Select(p => new { p.Id, p.TargetId })
                    .FirstOrDefaultAsync(cancel);

                if (puzzle == null) return null;

                var target = await dbContext.DailyCommands
                    .Include(c => c.Categories)
                    .Where(c => c.Id == puzzle.TargetId)
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

                return target != null ? (puzzle.Id, target) : ((int, DailyCommandDto)?)null;
            },
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.DailyContent },
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"No daily puzzle found for {today:yyyy-MM-dd}");

        return cachedTarget;
    }

    public async Task<DailyCommandDto?> GetYesterdaysTargetAsync(CancellationToken cancellationToken = default)
    {
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);

        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyCommandTarget(yesterday),
            async cancel =>
            {
                var targetId = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyCommands && p.ScheduledDate == yesterday)
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
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.DailyContent },
            cancellationToken: cancellationToken);
    }
    
    public async Task<DailyCommandDto> HandleUserGiveUpAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var (puzzleId, target) = await GetDailyTargetAsync(today, cancellationToken);

        var guessesCount = await dbContext.UserGuesses
            .CountAsync(ug => ug.UserId == userId && ug.PuzzleId == puzzleId && ug.Date == today, cancellationToken);

        if (guessesCount < gameSettings.Value.MinGuessesToGiveUp)
            throw new BadRequestException($"You must make at least {gameSettings.Value.MinGuessesToGiveUp} guesses before you can give up.");

        var hasGivenUp = await dbContext.UserGiveUps
            .AnyAsync(ug => ug.UserId == userId && ug.PuzzleId == puzzleId && ug.Date == today, cancellationToken);

        if (hasGivenUp)
            throw new BadRequestException("You have already given up today.");

        dbContext.UserGiveUps.Add(UserGiveUp.Create(userId, puzzleId, GameIds.DailyCommands, today));
        await dbContext.SaveChangesAsync(cancellationToken);

        return target;
    }
}
