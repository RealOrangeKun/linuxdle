# syntax=docker/dockerfile:1.7

# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# 1. Copy ONLY files needed for restore
COPY Linuxdle.slnx ./
COPY Directory.Packages.props ./
COPY global.json ./

# Manually copy .csproj files to maintain folder structure for restore
COPY src/Linuxdle.Api/Linuxdle.Api.csproj ./src/Linuxdle.Api/
COPY src/Linuxdle.Domain/Linuxdle.Domain.csproj ./src/Linuxdle.Domain/
COPY src/Linuxdle.Infrastructure/Linuxdle.Infrastructure.csproj ./src/Linuxdle.Infrastructure/
COPY src/Linuxdle.Services/Linuxdle.Services.csproj ./src/Linuxdle.Services/
COPY tests/Linuxdle.UnitTests/Linuxdle.UnitTests.csproj ./tests/Linuxdle.UnitTests/
COPY tests/Linuxdle.IntegrationTests/Linuxdle.IntegrationTests.csproj ./tests/Linuxdle.IntegrationTests/

# 2. Restore dependencies (This layer will be cached unless your .csproj/props change)
RUN --mount=type=cache,id=linuxdle-nuget-packages,target=/root/.nuget/packages \
    --mount=type=cache,id=linuxdle-nuget-http,target=/root/.local/share/NuGet/v3-cache \
    dotnet restore Linuxdle.slnx

# 3. NOW copy the rest of the source code
COPY src/ ./src/
COPY tests/ ./tests/

# 4. Build and publish (Adding --no-restore saves time as we already did it)
RUN --mount=type=cache,id=linuxdle-nuget-packages,target=/root/.nuget/packages \
    --mount=type=cache,id=linuxdle-nuget-http,target=/root/.local/share/NuGet/v3-cache \
    dotnet publish src/Linuxdle.Api/Linuxdle.Api.csproj \
    -c Release \
    -o /app/publish

# --- Runtime stage ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Combine apt commands and cleanup (Good for image size, minor for speed)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Linuxdle.Api.dll"]