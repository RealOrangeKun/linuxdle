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
    public int CurrentStreak { get; private set; }
    public DateOnly? LastCompletedDate { get; private set; }

    public static User Create(int daysToExpiration)
    {
        var now = DateTime.UtcNow;
        return new()
        {
            Id = Guid.CreateVersion7(),
            RefreshToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)),
            CreatedAt = now,
            LastRefreshAt = now,
            ExpiresAt = now.AddDays(daysToExpiration),
            CurrentStreak = 0,
            LastCompletedDate = null
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

    public void UpdateStreak(DateOnly completedDate)
    {
        if (LastCompletedDate.HasValue && completedDate == LastCompletedDate.Value.AddDays(1))
        {
            CurrentStreak++;
        }
        else if (!LastCompletedDate.HasValue || completedDate != LastCompletedDate.Value)
        {
            CurrentStreak = 1;
        }

        LastCompletedDate = completedDate;
    }

    public void ResetStreakIfNeeded(DateOnly today)
    {
        if (LastCompletedDate.HasValue && today > LastCompletedDate.Value.AddDays(1))
        {
            CurrentStreak = 0;
        }
    }

    public void ResetStreakForGiveUp()
    {
        CurrentStreak = 0;
    }

    public bool IsRefreshExpired => ExpiresAt < DateTime.UtcNow;
}
