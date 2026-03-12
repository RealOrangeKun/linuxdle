namespace Linuxdle.Services.Common.Constants;

public static class CacheExpirations
{
    public static readonly TimeSpan StaticData = TimeSpan.FromDays(30);

    public static TimeSpan DailyContent
    {
        get
        {
            var now = DateTime.UtcNow;
            var tomorrow = now.Date.AddDays(1);
            return tomorrow - now;
        }
    }

    public static readonly TimeSpan ProcessedAssets = TimeSpan.FromDays(7);

    public static readonly TimeSpan DistroImages = TimeSpan.FromDays(1);
}
