using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.DailyPuzzles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Options;
using Moq;

namespace Linuxdle.UnitTests;

public class DailyPuzzleServiceTests
{
    private LinuxdleDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<LinuxdleDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new LinuxdleDbContext(options);
    }

    [Fact]
    public void Constructor_ShouldNotThrow_WhenDependenciesAreProvided()
    {
        // Arrange
        var dbContext = GetInMemoryDbContext();
        var mockHybridCache = new Mock<HybridCache>();
        var mockOptions = new Mock<IOptions<DailyPuzzleOptions>>();
        mockOptions.Setup(o => o.Value).Returns(new DailyPuzzleOptions { DaysToSchedule = 30, CronSchedule = "0 0 * * *" });
        var logger = Microsoft.Extensions.Logging.Abstractions.NullLogger<DailyPuzzleService>.Instance;

        // Act
        var service = new DailyPuzzleService(dbContext, mockHybridCache.Object, mockOptions.Object, logger);

        // Assert
        Assert.NotNull(service);
    }
}
