using Linuxdle.Infrastructure.Data;
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

        var target = await hybridCache.GetOrCreateAsync(
            $"daily_distro_target_{today}", async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Where(dd => dbContext.DailyPuzzles
                .Any(dp => dp.ScheduledDate == today && dp.TargetId == dd.Id))
                .Select(dd => new { dd.Id, dd.LogoPath })
                .FirstOrDefaultAsync(cancel),
            cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"No daily puzzle found for {today:yyyy-MM-dd}");

        var filePath = Path.Combine(_contentRoot, target.LogoPath);

        int cappedTries = Math.Min(numberOfTries, _imageOptions.MaxRetries);

        return await hybridCache.GetOrCreateAsync(
            $"daily_distro_image_{today}_tries_{cappedTries}_hardmode_{hardMode}",
            async cancel => await DistroImageProcessor.ProcessDistroImageAsync(filePath, cappedTries, _imageOptions, hardMode, cancel),
            cancellationToken: cancellationToken,
            options: new HybridCacheEntryOptions { Expiration = TimeSpan.FromDays(1) });
    }

    public async Task<IEnumerable<DailyDistroDto>> GetDailyDistrosAsync(CancellationToken cancellationToken = default)
    {
        return await hybridCache.GetOrCreateAsync(
            $"all_distros",
            async cancel => await dbContext.DailyDistros
                .AsNoTracking()
                .Select(dd => new DailyDistroDto(dd.Name, dd.Slug))
                .ToListAsync(cancel), cancellationToken: cancellationToken);
    }

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
