using Linuxdle.Domain.Users;
using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Dtos.Records;
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

    public Task RefreshUserToken(string refreshToken, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}
