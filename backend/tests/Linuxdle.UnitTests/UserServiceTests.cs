using Linuxdle.Infrastructure.Data;
using Linuxdle.Services.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;

namespace Linuxdle.UnitTests;

public class UserServiceTests
{
    private LinuxdleDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<LinuxdleDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new LinuxdleDbContext(options);
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldCreateUserAndReturnTokens()
    {
        // Arrange
        var dbContext = GetInMemoryDbContext();

        var accessTokenOptions = new Mock<IOptions<AccessTokenOptions>>();
        accessTokenOptions.Setup(o => o.Value).Returns(new AccessTokenOptions
        {
            SecretKey = "a_very_long_super_secret_key_for_testing_purposes_1234567890",
            ExpirationMinutes = 15,
            Issuer = "test",
            Audience = "test"
        });

        var refreshTokenOptions = new Mock<IOptions<RefreshTokenOptions>>();
        refreshTokenOptions.Setup(o => o.Value).Returns(new RefreshTokenOptions { MaxAgeDays = 30 });

        var userService = new UserService(dbContext, accessTokenOptions.Object, refreshTokenOptions.Object);

        // Act
        var result = await userService.RegisterUserAsync();

        // Assert
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.Equal(1, await dbContext.Users.CountAsync());
    }

    [Fact]
    public async Task RefreshUserToken_ShouldThrowException_WhenTokenIsInvalid()
    {
        // Arrange
        var dbContext = GetInMemoryDbContext();
        var accessTokenOptions = new Mock<IOptions<AccessTokenOptions>>();
        var refreshTokenOptions = new Mock<IOptions<RefreshTokenOptions>>();
        var userService = new UserService(dbContext, accessTokenOptions.Object, refreshTokenOptions.Object);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => userService.RefreshUserToken("invalid-token"));
    }
}
