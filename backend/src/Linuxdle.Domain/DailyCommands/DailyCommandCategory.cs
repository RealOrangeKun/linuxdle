namespace Linuxdle.Domain.DailyCommands;

public sealed class DailyCommandCategory
{
    private DailyCommandCategory() { }

    public int Id { get; private set; }
    public string Name { get; private set; } = null!;

    public ICollection<DailyCommand> Commands { get; private set; } = [];

    public static DailyCommandCategory Create(string name)
    {
        return new()
        {
            Name = name
        };
    }
}
