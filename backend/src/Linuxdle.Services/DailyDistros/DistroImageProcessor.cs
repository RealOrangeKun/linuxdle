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

        double zoomPercentage = Math.Min(1.0, options.InitialZoomPercentage + (numberOfTries - 1) * options.ZoomOutIncrement);

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
            .Resize(options.OutputSize, options.OutputSize));

        using var ms = new MemoryStream();
        await image.SaveAsPngAsync(ms, cancellationToken);

        return ms.ToArray();
    }
}
