namespace Linuxdle.Domain.Users;

public sealed class User
{
    private User() { }

    public Guid Id { get; private set; }
    public string RefreshToken { get; private set; } = null!;
    public DateTime LastRefreshAt { get; private set; }
}
