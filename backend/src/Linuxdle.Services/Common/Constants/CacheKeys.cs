namespace Linuxdle.Services.Common.Constants;

internal static class CacheKeys
{
    public static string DailyDistroTarget(DateOnly date) => $"daily_distro_target_{date:yyyy-MM-dd}";
    public static string DailyDistroImage(DateOnly date, int tries, bool hardMode) => $"daily_distro_image_{date:yyyy-MM-dd}_tries_{tries}_hardmode_{hardMode}";
    public static string AllDistros => "all_distros";
    public static string DistroBySlug(string slug) => $"distro_{slug.ToLower()}";

    public static string DailyCommandTarget(DateOnly date) => $"daily_command_target_{date:yyyy-MM-dd}";
    public static string CommandByName(string name) => $"command_{name.ToLower()}";
    public static string CommandInfoByCommandId(int commandId) => $"command_info_{commandId}";
    public static string AllCommandNames => "all_command_names";

    public static string AllGameIds => "all_game_ids";

    public static string DailyDesktopEnvironmentTarget(DateOnly date) => $"daily_de_target_{date:yyyy-MM-dd}";
    public static string DailyDesktopEnvironmentScreenshot(int screenshotId) => $"daily_de_screenshot_{screenshotId}";
    public static string DesktopEnvironmentBySlug(string slug) => $"de_{slug.ToLower()}";
    public static string AllDesktopEnvironments => "all_desktop_environments";
}
