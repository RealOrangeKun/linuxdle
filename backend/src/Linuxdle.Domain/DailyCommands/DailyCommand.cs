using System.Text.Json.Serialization;

namespace Linuxdle.Domain.DailyCommands;

public sealed class DailyCommand
{
    private DailyCommand() { }

    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string Package { get; private set; } = null!;
    public int OriginYear { get; private set; }
    public int ManSection { get; private set; }
    public bool IsBuiltIn { get; private set; }
    public bool RequiresArgs { get; private set; }
    public bool IsPosix { get; private set; }

    [JsonIgnore]
    public ICollection<DailyCommandCategory> Categories { get; private set; } = [];

    public static DailyCommand Create(
        string name,
        string package,
        int originYear,
        int manSection,
        bool isBuiltIn,
        bool requiresArgs,
        bool isPosix)
    {
        return new()
        {
            Name = name,
            Package = package,
            OriginYear = originYear,
            ManSection = manSection,
            IsBuiltIn = isBuiltIn,
            RequiresArgs = requiresArgs,
            IsPosix = isPosix
        };
    }

    public void Update(string package, int manSection, bool isBuiltIn, bool requiresArgs, bool isPosix)
    {
        Package = package;
        ManSection = manSection;
        IsBuiltIn = isBuiltIn;
        RequiresArgs = requiresArgs;
        IsPosix = isPosix;
    }
}
