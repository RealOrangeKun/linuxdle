# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project files
COPY Linuxdle.slnx ./
COPY Directory.Packages.props ./
COPY global.json ./
COPY src/ ./src/

# Restore dependencies
RUN dotnet restore Linuxdle.slnx

# Build and publish
RUN dotnet publish src/Linuxdle.Api/Linuxdle.Api.csproj -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "Linuxdle.Api.dll"]