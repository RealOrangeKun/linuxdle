namespace Linuxdle.Services.Users;

public sealed class RefreshTokenOptions
{
    public string CookieName { get; set; } = null!;
    public bool HttpOnly { get; set; }
    public bool Secure { get; set; }
    public string SameSite { get; set; } = null!;
    public int MaxAgeDays { get; set; }
    public string Path { get; set; } = null!;
    public string? Domain { get; set; }
}
