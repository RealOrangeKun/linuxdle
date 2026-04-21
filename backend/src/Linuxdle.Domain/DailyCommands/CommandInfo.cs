namespace Linuxdle.Domain.DailyCommands;

public sealed class CommandInfo
{
    private CommandInfo() { }

    public int Id { get; private set; }
    public int CommandId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string Synopsis { get; private set; } = string.Empty;
    public string Example { get; private set; } = string.Empty;
    public string FunFact { get; private set; } = string.Empty;

    public DailyCommand Command { get; private set; } = null!;

    public static CommandInfo Create(
        int commandId,
        string description,
        string synopsis,
        string example,
        string funFact)
    {
        return new()
        {
            CommandId = commandId,
            Description = description,
            Synopsis = synopsis,
            Example = example,
            FunFact = funFact
        };
    }
}
