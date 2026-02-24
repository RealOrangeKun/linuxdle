using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Linuxdle.Services.DailyDistros;

internal static class DistroImageProcessor
{
    public static async Task<byte[]> ProcessDistroImageAsync(
        string filePath,
        int numberOfTries,
        DistroImageOptions options,
        CancellationToken cancellationToken = default)
    {
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("Distro image not found", filePath);
        }

        using var image = await Image.LoadAsync(filePath, cancellationToken);

        double qualityIncrement = options.MaxRetries > 1
            ? (1.0 - options.InitialQualityPercentage) / (options.MaxRetries - 1)
            : 0;

        double linearProgress = Math.Max(0, numberOfTries - 1) / (double)(options.MaxRetries - 1);
        double exponentialProgress = Math.Pow(linearProgress, 1.8);

        double qualityPercentage = Math.Min(1.0, options.InitialQualityPercentage + exponentialProgress * (1.0 - options.InitialQualityPercentage));

        int pixelatedSize = (int)(options.OutputSize * qualityPercentage);
        pixelatedSize = Math.Max(1, pixelatedSize);

        float blurAmount = (float)(15.0 * (1.0 - qualityPercentage));

        image.Mutate(x => x
            .GaussianBlur(Math.Max(blurAmount, 0.1f))
            .Resize(pixelatedSize, pixelatedSize, KnownResamplers.NearestNeighbor)
            .Resize(options.OutputSize, options.OutputSize, KnownResamplers.NearestNeighbor));

        using var ms = new MemoryStream();
        await image.SaveAsPngAsync(ms, cancellationToken);

        return ms.ToArray();
    }
}
