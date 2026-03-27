using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.Users;

public interface IUserStreakService
{
    Task<UserStreakDto?> UpdateStreakIfAllGamesCompletedAsync(
        Guid userId,
        DateOnly today,
        CancellationToken cancellationToken = default);

    Task<UserStreakDto> GetUserStreakAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
