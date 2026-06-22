namespace Linuxdle.Services.Dtos.Records;

public sealed record PastPuzzleDto(
    int Id,
    int GameId,
    DateOnly ScheduledDate,
    bool IsCompleted,
    bool IsAttempted
);
