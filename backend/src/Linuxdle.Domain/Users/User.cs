using System.Security.Cryptography;

namespace Linuxdle.Domain.Users;

public sealed class User
{
    private User() { }

    public Guid Id { get; private set; }
    public string RefreshToken { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }
    public DateTime LastRefreshAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }

    public static User Create(int daysToExpiration)
    {
        var now = DateTime.UtcNow;
        return new()
        {
            Id = Guid.CreateVersion7(),
            RefreshToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)),
            CreatedAt = now,
            LastRefreshAt = now,
            ExpiresAt = now.AddDays(daysToExpiration)
        };
    }

    public void Refresh(int daysToExpiration)
    {
        if (IsRefreshExpired)
        {
            return;
        }

        RefreshToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        LastRefreshAt = DateTime.UtcNow;
        ExpiresAt = DateTime.UtcNow.AddDays(daysToExpiration);
    }

    public bool IsRefreshExpired => ExpiresAt < DateTime.UtcNow;
}
