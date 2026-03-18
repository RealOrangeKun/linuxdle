using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Linuxdle.IntegrationTests;

public class DailyDesktopEnvironmentsIntegrationTests : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly IntegrationTestWebAppFactory _factory;

    public DailyDesktopEnvironmentsIntegrationTests(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetDailyDesktopEnvironments_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/daily-desktop-environments");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
