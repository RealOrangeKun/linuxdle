using Linuxdle.Domain.Exceptions;
using Linuxdle.Domain.Games;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Common.Constants;
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
    IOptions<DistroImageOptions> imageOptions)
    : IDailyDistroService
{
    private readonly string _contentRoot = webHostEnvironment.WebRootPath;
    private readonly DistroImageOptions _imageOptions = imageOptions.Value;

    public async Task<byte[]> GenerateDailyDistroLogoAsync(int numberOfTries, bool hardMode, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await GetDailyTargetAsync(today, cancellationToken);

        var filePath = Path.Combine(_contentRoot, target.LogoPath);

        int cappedTries = Math.Min(numberOfTries, _imageOptions.MaxRetries);

        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDistroImage(today, cappedTries, hardMode),
            async cancel => await DistroImageProcessor.ProcessDistroImageAsync(filePath, cappedTries, _imageOptions, hardMode, cancel),
            cancellationToken: cancellationToken,
            options: new HybridCacheEntryOptions { Expiration = TimeSpan.FromDays(1) });
    }

    public async Task<IEnumerable<DailyDistroDto>> GetDailyDistrosAsync(CancellationToken cancellationToken = default)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.AllDistros,
            async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Select(dd => new DailyDistroDto(dd.Name, dd.Slug))
                .ToListAsync(cancel), cancellationToken: cancellationToken);
    }

    public async Task<DailyDistroGuessResultDto> HandleUserGuessAsync(string userGuess, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var target = await GetDailyTargetAsync(today, cancellationToken);

        var guess = await hybridCache.GetOrCreateAsync(
            CacheKeys.DistroBySlug(userGuess),
            async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Where(dd => dd.Slug == userGuess.ToLower())
                .Select(dd => new { dd.Id })
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"No Distro found for {userGuess}");

        return new(guess.Id == target.Id);
    }

    private async Task<DailyDistroTargetInfo> GetDailyTargetAsync(DateOnly today, CancellationToken cancellationToken)
    {
        return await hybridCache.GetOrCreateAsync(
            CacheKeys.DailyDistroTarget(today),
            async cancel =>
            {
                var targetId = await dbContext.DailyPuzzles
                    .AsNoTracking()
                    .Where(p => p.GameId == GameIds.DailyDistros && p.ScheduledDate == today)
                    .Select(p => p.TargetId)
                    .FirstOrDefaultAsync(cancel);

                if (targetId == default) return null;

                return await dbContext.DailyDistros
                    .AsNoTracking()
                    .Where(dd => dd.Id == targetId)
                    .Select(dd => new DailyDistroTargetInfo(dd.Id, dd.LogoPath))
                    .FirstOrDefaultAsync(cancel);
            },
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"No daily puzzle found for {today:yyyy-MM-dd}");
    }

    private sealed record DailyDistroTargetInfo(int Id, string LogoPath);
}
