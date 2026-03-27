using Linuxdle.Domain.Games;
using Linuxdle.Domain.Users;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;

namespace Linuxdle.Services.Users;

internal sealed class UserStreakService(LinuxdleDbContext dbContext) : IUserStreakService
{
    private static readonly int[] RequiredGameIds = [GameIds.DailyCommands, GameIds.DailyDistros, GameIds.DailyDesktopEnvironments];

    public async Task<UserStreakDto?> UpdateStreakIfAllGamesCompletedAsync(
        Guid userId,
        DateOnly today,
        CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new InvalidOperationException($"User with ID {userId} not found");

        var resetByGiveUp = await ApplyResetRulesAsync(user, today, cancellationToken);

        if (resetByGiveUp)
        {
            return new UserStreakDto(user.CurrentStreak, user.LastCompletedDate);
        }

        var completedGamesCount = await dbContext.UserGuesses
            .AsNoTracking()
            .Where(ug => ug.UserId == userId && ug.Date == today && ug.IsCorrect)
            .Select(ug => ug.GameId)
            .Distinct()
            .CountAsync(cancellationToken);

        if (completedGamesCount != RequiredGameIds.Length)
        {
            return null;
        }

        user.UpdateStreak(today);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new UserStreakDto(user.CurrentStreak, user.LastCompletedDate);
    }

    public async Task<UserStreakDto> GetUserStreakAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new InvalidOperationException($"User with ID {userId} not found");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await ApplyResetRulesAsync(user, today, cancellationToken);

        return new UserStreakDto(user.CurrentStreak, user.LastCompletedDate);
    }

    private async Task<bool> ApplyResetRulesAsync(
        User user,
        DateOnly today,
        CancellationToken cancellationToken)
    {
        var resetByGiveUp = await dbContext.UserGiveUps
            .AsNoTracking()
            .AnyAsync(ug => ug.UserId == user.Id && ug.Date == today, cancellationToken);

        if (resetByGiveUp)
        {
            user.ResetStreakForGiveUp();
        }

        user.ResetStreakIfNeeded(today);

        await dbContext.SaveChangesAsync(cancellationToken);

        return resetByGiveUp;
    }
}
