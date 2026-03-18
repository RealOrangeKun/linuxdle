using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Linuxdle.IntegrationTests;

public class DailyDistrosIntegrationTests : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly IntegrationTestWebAppFactory _factory;

    public DailyDistrosIntegrationTests(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetDailyDistros_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/daily-distros");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
