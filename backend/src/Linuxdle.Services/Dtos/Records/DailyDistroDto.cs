namespace Linuxdle.Services.Dtos.Records;

public sealed record DailyDistroDto(
    int Id,
    string Name,
    string Slug,
    string LogoPath,
    string BaseDistro,
    string DefaultDe,
    int ReleaseYear);
