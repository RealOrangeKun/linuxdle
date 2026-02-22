namespace Linuxdle.Services.DailyPuzzles;

public interface IDailyPuzzleService
{
    Task PrepareDailyPuzzle(CancellationToken cancellationToken = default);
}
