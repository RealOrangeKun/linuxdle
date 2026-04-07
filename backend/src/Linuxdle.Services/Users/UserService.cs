using Linuxdle.Domain.Users;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos.Records;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Linuxdle.Services.Users;

internal sealed class UserService(
    LinuxdleDbContext dbContext,
    IOptions<AccessTokenOptions> accessTokenOptions,
    IOptions<RefreshTokenOptions> refreshTokenOptions) : IUserService
{
    public async Task<UserTokensDto> RegisterUserAsync(CancellationToken cancellationToken = default)
    {
        var user = User.Create(refreshTokenOptions.Value.MaxAgeDays);

        await dbContext.Users.AddAsync(user, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var accessToken = JwtTokenGenerator.GenerateJwtToken(user.Id, accessTokenOptions.Value);

        return new UserTokensDto(accessToken, user.RefreshToken);
    }

    public async Task<UserTokensDto> RefreshUserToken(string refreshToken, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var user = await dbContext.Users
            .AsNoTracking()
            .Where(u => u.RefreshToken == refreshToken)
            .Select(u => new { u.Id, u.ExpiresAt })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new UnauthorizedAccessException("User with the provided refresh token does not exist.");

        if (user.ExpiresAt < now)
        {
            throw new UnauthorizedAccessException("Refresh token is already expired");
        }

        var newRefreshToken = User.CreateRefreshToken();
        var newExpiration = now.AddDays(refreshTokenOptions.Value.MaxAgeDays);

        var matchedUsers = await dbContext.Users
            .Where(u => u.RefreshToken == refreshToken && u.ExpiresAt >= now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(u => u.RefreshToken, newRefreshToken)
                .SetProperty(u => u.LastRefreshAt, now)
                .SetProperty(u => u.ExpiresAt, newExpiration), cancellationToken);

        if (matchedUsers == 0)
        {
            var expiredUserExists = await dbContext.Users
                .AnyAsync(u => u.RefreshToken == refreshToken, cancellationToken);

            throw new UnauthorizedAccessException(
                expiredUserExists
                    ? "Refresh token is already expired"
                    : "User with the provided refresh token does not exist.");
        }

        var accessToken = JwtTokenGenerator.GenerateJwtToken(user.Id, accessTokenOptions.Value);

        return new(accessToken, newRefreshToken);
    }

    public async Task CleanUnactiveUsers(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var cutoffDate = today.Subtract(TimeSpan.FromDays(refreshTokenOptions.Value.MaxAgeDays));

        await dbContext.Users
            .Where(u => u.LastRefreshAt < cutoffDate)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
