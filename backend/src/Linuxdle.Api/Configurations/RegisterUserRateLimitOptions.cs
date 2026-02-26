namespace Linuxdle.Api.Configurations;

public sealed class RegisterUserRateLimitOptions
{
    public int PermitLimit { get; set; }
    public int WindowInSeconds { get; set; }
    public int QueueLimit { get; set; }
}
