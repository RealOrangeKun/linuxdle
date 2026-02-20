namespace Linuxdle.Services.Dtos.Records;

public sealed record DailyCommandDto(
    int Id,
    string Name,
    string Package,
    int OriginYear,
    int ManSection,
    bool IsBuiltIn,
    bool RequiresArgs,
    bool IsPosix,
    HashSet<int> CategoryIds,
    List<string> CategoryNames
);
