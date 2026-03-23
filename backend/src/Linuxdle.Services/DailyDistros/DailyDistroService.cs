using Linuxdle.Domain.Exceptions;
using Linuxdle.Domain.Games;
using Linuxdle.Domain.UserGiveUps;
using Linuxdle.Domain.UserGuesses;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Common.Constants;
using Linuxdle.Services.Configurations;
using Linuxdle.Services.Dtos.Records;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Options;

namespace Linuxdle.Services.DailyDistros;

internal sealed class DailyDistroService(
    LinuxdleDbContext dbContext,
    HybridCache hybridCache,
    IWebHostEnvironment webHostEnvironment,
    IOptions<DistroImageOptions> imageOptions,
    IOptions<GameSettings> gameSettings)
    : IDailyDistroService
{
    private readonly string _contentRoot = webHostEnvironment.WebRootPath;
    private readonly DistroImageOptions _imageOptions = imageOptions.Value;
    private readonly GameSettings _gameSettings = gameSettings.Value;

    public async Task<byte[]> GenerateDailyDistroLogoAsync(int numberOfTries, bool hardMode, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var (_, target) = await GetDailyTargetAsync(today, cancellationToken);

        var filePath = Path.Combine(_contentRoot, target.LogoPath);

        int cappedTries = Math.Min(numberOfTries, _imageOptions.MaxRetries);

        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDistroImage(today, cappedTries, hardMode),
            async cancel => await DistroImageProcessor.ProcessDistroImageAsync(filePath, cappedTries, _imageOptions, hardMode, cancel),
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.DistroImages },
            cancellationToken: cancellationToken);
    }

    public async Task<IEnumerable<DailyDistroDto>> GetDailyDistrosAsync(CancellationToken cancellationToken = default)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.AllDistros,
            async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Select(dd => new DailyDistroDto(dd.Name, dd.Slug))
                .ToListAsync(cancel),
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
            cancellationToken: cancellationToken);
    }

    public async Task<DailyDistroGuessResultDto> HandleUserGuessAsync(Guid userId, string userGuess, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var (puzzleId, target) = await GetDailyTargetAsync(today, cancellationToken);
        
        bool hasGivenUp = await dbContext.UserGiveUps
            .AnyAsync(ug => ug.UserId == userId && ug.PuzzleId == puzzleId && ug.Date == today, cancellationToken);
            
        if (hasGivenUp)
            throw new BadRequestException("You have already given up today.");

        var guess = await hybridCache.GetOrCreateAsync(
            CacheKeys.DistroBySlug(userGuess),
            async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Where(dd => dd.Slug == userGuess.ToLower())
                .Select(dd => new { dd.Id })
                .FirstOrDefaultAsync(cancel),
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.StaticData },
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"No Distro found for {userGuess}");

        var isCorrect = guess.Id == target.Id;

        dbContext.UserGuesses.Add(UserGuess.Create(userId, puzzleId, GameIds.DailyDistros, today, target.Id, isCorrect));
        await dbContext.SaveChangesAsync(cancellationToken);

        return new(isCorrect);
    }

    private async Task<(int PuzzleId, DailyDistroTargetInfo Target)> GetDailyTargetAsync(DateOnly today, CancellationToken cancellationToken)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDistroTarget(today),
            async cancel =>
            {
                var puzzle = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyDistros && p.ScheduledDate == today)
                    .Select(p => new { p.Id, p.TargetId })
                    .FirstOrDefaultAsync(cancel);

                if (puzzle == null) return null;

                var target = await dbContext.DailyDistros
                    .AsNoTracking()
                    .Where(dd => dd.Id == puzzle.TargetId)
                    .Select(dd => new DailyDistroTargetInfo(dd.Id, dd.LogoPath))
                    .FirstOrDefaultAsync(cancel);

                return target != null ? (puzzle.Id, target) : ((int, DailyDistroTargetInfo)?)null;
            },
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.DailyContent },
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"No daily puzzle found for {today:yyyy-MM-dd}");
    }

    private sealed record DailyDistroTargetInfo(int Id, string LogoPath);

    public async Task<DailyDistroDto?> GetYesterdaysTargetAsync(CancellationToken cancellationToken = default)
    {
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);

        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDistroTarget(yesterday),
            async cancel =>
            {
                var targetId = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyDistros && p.ScheduledDate == yesterday)
                    .Select(p => p.TargetId)
                    .FirstOrDefaultAsync(cancel);

                if (targetId == default) return null;

                return await dbContext.DailyDistros
                    .AsNoTracking()
                    .Where(dd => dd.Id == targetId)
                    .Select(dd => new DailyDistroDto(dd.Name, dd.Slug))
                    .FirstOrDefaultAsync(cancel);
            },
            options: new HybridCacheEntryOptions { Expiration = CacheExpirations.DailyContent },
            cancellationToken: cancellationToken);
    }
    
    public async Task<DailyDistroDto> HandleUserGiveUpAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var (puzzleId, target) = await GetDailyTargetAsync(today, cancellationToken);

        var guessesCount = await dbContext.UserGuesses
            .CountAsync(ug => ug.UserId == userId && ug.PuzzleId == puzzleId && ug.Date == today, cancellationToken);

        if (guessesCount < _gameSettings.MinGuessesToGiveUp)
        {
            throw new BadRequestException($"You must make at least {_gameSettings.MinGuessesToGiveUp} guesses before you can give up.");
        }

        var hasGivenUp = await dbContext.UserGiveUps
            .AnyAsync(ug => ug.UserId == userId && ug.PuzzleId == puzzleId && ug.Date == today, cancellationToken);

        if (hasGivenUp)
        {
            throw new BadRequestException("You have already given up today.");
        }

        dbContext.UserGiveUps.Add(UserGiveUp.Create(userId, puzzleId, GameIds.DailyDistros, today));
        await dbContext.SaveChangesAsync(cancellationToken);

        var distro = await dbContext.DailyDistros.Where(d => d.Id == target.Id).FirstOrDefaultAsync(cancellationToken);
        return new DailyDistroDto(distro!.Name, distro.Slug);
    }
}
