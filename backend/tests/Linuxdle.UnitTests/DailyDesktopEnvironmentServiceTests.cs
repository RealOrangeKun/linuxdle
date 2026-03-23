using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.DailyDesktopEnvironments;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.Hybrid;
using Moq;

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
        var mockGameSettings = new Mock<Microsoft.Extensions.Options.IOptions<Linuxdle.Services.Configurations.GameSettings>>();

        // Act
        var service = new DailyDesktopEnvironmentService(dbContext, mockHybridCache.Object, mockGameSettings.Object);

        // Assert
        Assert.NotNull(service);
    }

    private HybridCache GetHybridCache()
    {
        var services = new Microsoft.Extensions.DependencyInjection.ServiceCollection();
#pragma warning disable EXTEXP0018
        services.AddHybridCache();
#pragma warning restore EXTEXP0018
        return services.BuildServiceProvider().GetRequiredService<HybridCache>();
    }

    private void SeedDailyTarget(LinuxdleDbContext dbContext)
    {
        var target = Linuxdle.Domain.DailyDesktopEnvironments.DailyDesktopEnvironment.Create("name", (Linuxdle.Domain.DailyDesktopEnvironments.DesktopEnvironmentType)1, "comp", "fam", "lang", 2000, "lang");
        dbContext.DailyDesktopEnvironments.Add(target);
        dbContext.Entry(target).Property("Slug").CurrentValue = "slug";
        dbContext.SaveChanges();

        var puzzle = Linuxdle.Domain.DailyPuzzles.DailyPuzzle.Create(Linuxdle.Domain.Games.GameIds.DailyDesktopEnvironments, target.Id, DateOnly.FromDateTime(DateTime.UtcNow));
        dbContext.DailyPuzzles.Add(puzzle);
        dbContext.SaveChanges();
    }

    [Fact]
    public async Task HandleUserGiveUpAsync_ThrowsBadRequest_WhenGuessesLessThanMinimum()
    {
        var dbContext = GetInMemoryDbContext();
        SeedDailyTarget(dbContext);
        var hybridCache = GetHybridCache();
        var mockGameSettings = new Mock<Microsoft.Extensions.Options.IOptions<Linuxdle.Services.Configurations.GameSettings>>();
        mockGameSettings.Setup(x => x.Value).Returns(new Linuxdle.Services.Configurations.GameSettings { MinGuessesToGiveUp = 5 });
        var service = new DailyDesktopEnvironmentService(dbContext, hybridCache, mockGameSettings.Object);

        var exception = await Assert.ThrowsAsync<Linuxdle.Domain.Exceptions.BadRequestException>(() => service.HandleUserGiveUpAsync(Guid.NewGuid()));
        Assert.Equal("You must make at least 5 guesses before you can give up.", exception.Message);
    }

    [Fact]
    public async Task HandleUserGiveUpAsync_ThrowsBadRequest_WhenAlreadyGivenUp()
    {
        var dbContext = GetInMemoryDbContext();
        SeedDailyTarget(dbContext);
        var hybridCache = GetHybridCache();
        var mockGameSettings = new Mock<Microsoft.Extensions.Options.IOptions<Linuxdle.Services.Configurations.GameSettings>>();
        mockGameSettings.Setup(x => x.Value).Returns(new Linuxdle.Services.Configurations.GameSettings { MinGuessesToGiveUp = 1 });
        var service = new DailyDesktopEnvironmentService(dbContext, hybridCache, mockGameSettings.Object);

        var userId = Guid.NewGuid();
        var puzzleId = dbContext.DailyPuzzles.First().Id;
        
        dbContext.UserGuesses.Add(Linuxdle.Domain.UserGuesses.UserGuess.Create(userId, puzzleId, Linuxdle.Domain.Games.GameIds.DailyDesktopEnvironments, DateOnly.FromDateTime(DateTime.UtcNow), 1, false));
        dbContext.UserGiveUps.Add(Linuxdle.Domain.UserGiveUps.UserGiveUp.Create(userId, puzzleId, Linuxdle.Domain.Games.GameIds.DailyDesktopEnvironments, DateOnly.FromDateTime(DateTime.UtcNow)));
        await dbContext.SaveChangesAsync();

        var exception = await Assert.ThrowsAsync<Linuxdle.Domain.Exceptions.BadRequestException>(() => service.HandleUserGiveUpAsync(userId));
        Assert.Equal("You have already given up today.", exception.Message);
    }
}
