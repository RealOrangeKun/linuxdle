using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Linuxdle.IntegrationTests;

public class DailyCommandsIntegrationTests : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly IntegrationTestWebAppFactory _factory;

    public DailyCommandsIntegrationTests(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetDailyCommands_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/daily-commands");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
