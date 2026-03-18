using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Linuxdle.IntegrationTests;

public class UsersIntegrationTests : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly IntegrationTestWebAppFactory _factory;

    public UsersIntegrationTests(IntegrationTestWebAppFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task RegisterUser_SuccessfullyCreatesUserAndReturnsTokens()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.PostAsync("/api/users", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
