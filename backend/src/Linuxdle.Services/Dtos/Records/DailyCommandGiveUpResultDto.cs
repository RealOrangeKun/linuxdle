namespace Linuxdle.Services.Dtos.Records;

public sealed record DailyCommandGiveUpResultDto(
    GuessCommandDetails GuessCommandDetails,
    CommandInfoDetails? Info
);