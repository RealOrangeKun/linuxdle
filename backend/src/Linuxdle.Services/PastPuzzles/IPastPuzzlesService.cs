using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.PastPuzzles;

public interface IPastPuzzlesService
{
    Task<IEnumerable<PastPuzzleDto>> GetPastPuzzlesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<object> HandlePastGuessAsync(Guid userId, int puzzleId, string userGuess, int numberOfGuesses, CancellationToken cancellationToken = default);
    Task<object> HandlePastGiveUpAsync(Guid userId, int puzzleId, CancellationToken cancellationToken = default);
    Task ResetPastPuzzleAsync(Guid userId, int puzzleId, CancellationToken cancellationToken = default);
}
