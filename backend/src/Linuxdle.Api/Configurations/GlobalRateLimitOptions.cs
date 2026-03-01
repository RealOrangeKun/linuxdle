namespace Linuxdle.Api.Configurations
{
    public sealed class GlobalRateLimitOptions
    {
        public int PermitLimit { get; set; } = 50;
        public int WindowInSeconds { get; set; } = 60;
        public int QueueLimit { get; set; } = 0;
        public bool AutoReplenishment { get; set; } = true;
    }
}
