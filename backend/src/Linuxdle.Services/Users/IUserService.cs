using Linuxdle.Services.Dtos.Records;

namespace Linuxdle.Services.Users;

public interface IUserService
{
    Task<UserTokensDto> RegisterUserAsync(CancellationToken cancellationToken = default);
    Task RefreshUserToken(string refreshToken, CancellationToken cancellationToken = default);
}
