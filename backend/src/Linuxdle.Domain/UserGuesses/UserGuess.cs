using Linuxdle.Domain.DailyPuzzles;
using Linuxdle.Domain.Games;
using Linuxdle.Domain.Users;

namespace Linuxdle.Domain.UserGuesses;

public sealed class UserGuess
{
    private UserGuess() { }

    public int Id { get; private set; }
    public Guid UserId { get; private set; }
    public int PuzzleId { get; private set; }
    public int GameId { get; private set; }
    public int TargetId { get; private set; }
    public DateOnly Date { get; private set; }
    public bool IsCorrect { get; private set; }

    public User User { get; private set; } = null!;
    public DailyPuzzle Puzzle { get; private set; } = null!;
    public Game Game { get; private set; } = null!;

    public static UserGuess Create(Guid userId, int puzzleId, int gameId, DateOnly date, int targetId, bool isCorrect)
    {
        return new()
        {
            UserId = userId,
            PuzzleId = puzzleId,
            GameId = gameId,
            Date = date,
            TargetId = targetId,
            IsCorrect = isCorrect
        };
    }
}
