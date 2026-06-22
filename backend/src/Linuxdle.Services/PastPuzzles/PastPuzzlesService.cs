using Linuxdle.Domain.Exceptions;
using Linuxdle.Domain.Games;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.DailyCommands;
using Linuxdle.Services.DailyDesktopEnvironments;
using Linuxdle.Services.DailyDistros;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;

namespace Linuxdle.Services.PastPuzzles;

internal sealed class PastPuzzlesService(
    LinuxdleDbContext dbContext,
    IDailyCommandService dailyCommandService,
    IDailyDistroService dailyDistroService,
    IDailyDesktopEnvironmentService dailyDesktopEnvironmentService)
    : IPastPuzzlesService
{
    public async Task<IEnumerable<PastPuzzleDto>> GetPastPuzzlesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Fetch all puzzles before today
        var pastPuzzles = await dbContext.DailyPuzzles
            .AsNoTracking()
            .Where(p => p.ScheduledDate < today)
            .OrderByDescending(p => p.ScheduledDate)
            .ToListAsync(cancellationToken);

        // Get puzzle IDs where the user has guessed correctly
        var userCorrectPuzzles = await dbContext.UserGuesses
            .AsNoTracking()
            .Where(ug => ug.UserId == userId && ug.IsCorrect)
            .Select(ug => ug.PuzzleId)
            .ToHashSetAsync(cancellationToken);

        // Get puzzle IDs where the user has given up
        var userGiveUpPuzzles = await dbContext.UserGiveUps
            .AsNoTracking()
            .Where(ug => ug.UserId == userId)
            .Select(ug => ug.PuzzleId)
            .ToHashSetAsync(cancellationToken);

        // Get puzzle IDs where the user has made any attempt
        var userAttemptedPuzzles = await dbContext.UserGuesses
            .AsNoTracking()
            .Where(ug => ug.UserId == userId)
            .Select(ug => ug.PuzzleId)
            .ToHashSetAsync(cancellationToken);

        return pastPuzzles.Select(p => new PastPuzzleDto(
            p.Id,
            p.GameId,
            p.ScheduledDate,
            userCorrectPuzzles.Contains(p.Id) || userGiveUpPuzzles.Contains(p.Id),
            userAttemptedPuzzles.Contains(p.Id)
        ));
    }

    public async Task<object> HandlePastGuessAsync(Guid userId, int puzzleId, string userGuess, int numberOfGuesses, CancellationToken cancellationToken = default)
    {
        var puzzle = await dbContext.DailyPuzzles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == puzzleId, cancellationToken)
            ?? throw new NotFoundException($"Puzzle with ID {puzzleId} not found");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (puzzle.ScheduledDate >= today)
        {
            throw new BadRequestException("You can only play past puzzles through this endpoint.");
        }

        return puzzle.GameId switch
        {
            GameIds.DailyCommands =>
                await dailyCommandService.HandlePastGuessAsync(userId, puzzleId, userGuess, cancellationToken),
            GameIds.DailyDistros =>
                await dailyDistroService.HandlePastGuessAsync(userId, puzzleId, userGuess, cancellationToken),
            GameIds.DailyDesktopEnvironments =>
                await dailyDesktopEnvironmentService.HandlePastGuessAsync(userId, puzzleId, userGuess, numberOfGuesses, cancellationToken),
            _ => throw new BadRequestException($"Unknown game ID {puzzle.GameId}")
        };
    }

    public async Task<object> HandlePastGiveUpAsync(Guid userId, int puzzleId, CancellationToken cancellationToken = default)
    {
        var puzzle = await dbContext.DailyPuzzles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == puzzleId, cancellationToken)
            ?? throw new NotFoundException($"Puzzle with ID {puzzleId} not found");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (puzzle.ScheduledDate >= today)
        {
            throw new BadRequestException("You can only play past puzzles through this endpoint.");
        }

        return puzzle.GameId switch
        {
            GameIds.DailyCommands =>
                await dailyCommandService.HandlePastGiveUpAsync(userId, puzzleId, cancellationToken),
            GameIds.DailyDistros =>
                await dailyDistroService.HandlePastGiveUpAsync(userId, puzzleId, cancellationToken),
            GameIds.DailyDesktopEnvironments =>
                await dailyDesktopEnvironmentService.HandlePastGiveUpAsync(userId, puzzleId, cancellationToken),
            _ => throw new BadRequestException($"Unknown game ID {puzzle.GameId}")
        };
    }

    public async Task ResetPastPuzzleAsync(Guid userId, int puzzleId, CancellationToken cancellationToken = default)
    {
        var puzzle = await dbContext.DailyPuzzles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == puzzleId, cancellationToken)
            ?? throw new NotFoundException($"Puzzle with ID {puzzleId} not found");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (puzzle.ScheduledDate >= today)
        {
            throw new BadRequestException("You can only reset past puzzles.");
        }

        // Delete guesses
        var guesses = await dbContext.UserGuesses
            .Where(ug => ug.UserId == userId && ug.PuzzleId == puzzleId)
            .ToListAsync(cancellationToken);
        if (guesses.Count > 0)
        {
            dbContext.UserGuesses.RemoveRange(guesses);
        }

        // Delete giveup
        var giveUp = await dbContext.UserGiveUps
            .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.PuzzleId == puzzleId, cancellationToken);
        if (giveUp != null)
        {
            dbContext.UserGiveUps.Remove(giveUp);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
