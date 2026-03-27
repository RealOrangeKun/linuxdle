namespace Linuxdle.Services.Dtos.Records;

public sealed record UserStreakDto(int CurrentStreak, DateOnly? LastCompletedDate);
