using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Linuxdle.Services.DailyDistros;

internal static class DistroImageProcessor
{
    public static async Task<byte[]> ProcessDistroImageAsync(
        string filePath,
        int numberOfTries,
        int seed,
        DistroImageOptions options,
        CancellationToken cancellationToken = default)
    {
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("Distro image not found", filePath);
        }

        using var image = await Image.LoadAsync(filePath, cancellationToken);

        double zoomOutIncrement = options.MaxRetries > 1
            ? (1.0 - options.InitialZoomPercentage) / (options.MaxRetries - 1)
            : 0;

        double zoomPercentage = Math.Min(1.0, options.InitialZoomPercentage + Math.Max(0, numberOfTries - 1) * zoomOutIncrement);

        int minDimension = Math.Min(image.Width, image.Height);
        int cropSize = (int)(minDimension * zoomPercentage);

        cropSize = Math.Min(cropSize, Math.Min(image.Width, image.Height));

        var random = new Random(seed);
        int maxX = image.Width - cropSize;
        int maxY = image.Height - cropSize;
        int zoomX = maxX > 0 ? random.Next(0, maxX) : 0;
        int zoomY = maxY > 0 ? random.Next(0, maxY) : 0;

        image.Mutate(x => x
            .Crop(new Rectangle(zoomX, zoomY, cropSize, cropSize))
            .Resize(options.OutputSize, options.OutputSize)
            .Grayscale());

        using var ms = new MemoryStream();
        await image.SaveAsPngAsync(ms, cancellationToken);

        return ms.ToArray();
    }
}
