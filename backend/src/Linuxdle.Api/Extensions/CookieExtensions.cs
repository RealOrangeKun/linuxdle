using Linuxdle.Services.Users;

namespace Linuxdle.Api.Extensions;

internal static class CookieExtensions
{
    extension(HttpResponse response)
    {
        public void AppendRefreshToken(
            string refreshToken,
            RefreshTokenOptions options)
        {
            response.Cookies.Append(
                options.CookieName,
                refreshToken,
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddDays(options.MaxAgeDays),
                    HttpOnly = options.HttpOnly,
                    Secure = options.Secure,
                    SameSite = Enum.Parse<SameSiteMode>(options.SameSite),
                    Path = options.Path,
                    Domain = options.Domain
                });
        }
    }
}
