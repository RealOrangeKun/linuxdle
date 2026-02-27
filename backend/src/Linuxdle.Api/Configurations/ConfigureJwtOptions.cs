using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Linuxdle.Services.Users;

namespace Linuxdle.Api.Configurations;

public class ConfigureJwtOptions(IOptions<AccessTokenOptions> options) : IConfigureNamedOptions<JwtBearerOptions>
{
    private readonly AccessTokenOptions _accessTokenOptions = options.Value;

    public void Configure(string? name, JwtBearerOptions options) => Configure(options);

    public void Configure(JwtBearerOptions options)
    {
        if (string.IsNullOrEmpty(_accessTokenOptions.SecretKey))
        {
            throw new InvalidOperationException("JWT Secret Key is missing from configuration.");
        }

        var key = Encoding.UTF8.GetBytes(_accessTokenOptions.SecretKey);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),

            ValidateIssuer = true,
            ValidIssuer = _accessTokenOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = _accessTokenOptions.Audience,

            ValidateLifetime = true,
            RequireExpirationTime = true,

            ClockSkew = TimeSpan.FromSeconds(30)
        };
    }
}