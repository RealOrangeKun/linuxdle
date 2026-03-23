using Linuxdle.Domain.DailyPuzzles;
using Linuxdle.Domain.Games;
using Linuxdle.Domain.Users;

namespace Linuxdle.Domain.UserGiveUps;

public sealed class UserGiveUp
{
    private UserGiveUp() { }

    public int Id { get; private set; }
    public Guid UserId { get; private set; }
    public int PuzzleId { get; private set; }
    public int GameId { get; private set; }
    public DateOnly Date { get; private set; }

    public User User { get; private set; } = null!;
    public DailyPuzzle Puzzle { get; private set; } = null!;
    public Game Game { get; private set; } = null!;

    public static UserGiveUp Create(Guid userId, int puzzleId, int gameId, DateOnly date)
    {
        return new()
        {
            UserId = userId,
            PuzzleId = puzzleId,
            GameId = gameId,
            Date = date
        };
    }
}
