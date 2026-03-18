using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.DailyDesktopEnvironments;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Moq;
using Xunit;

namespace Linuxdle.UnitTests;

public class DailyDesktopEnvironmentServiceTests
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

        // Act
        var service = new DailyDesktopEnvironmentService(dbContext, mockHybridCache.Object);

        // Assert
        Assert.NotNull(service);
    }
}
