namespace Linuxdle.Domain.DailyPuzzles;

public sealed class DailyPuzzle
{
    private DailyPuzzle() { }
    public int Id { get; private set; }
    public int GameId { get; private set; }
    public int TargetId { get; private set; }
    public DateOnly ScheduledDate { get; private set; }

    public static DailyPuzzle Create(int gameId, int targetId, DateOnly scheduledDate)
    {
        return new()
        {
            GameId = gameId,
            TargetId = targetId,
            ScheduledDate = scheduledDate
        };
    }
}
