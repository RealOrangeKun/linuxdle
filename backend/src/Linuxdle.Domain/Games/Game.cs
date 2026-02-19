namespace Linuxdle.Domain.Games;

public sealed class Game
{
    private Game() { }

    public int Id { get; private set; }
    public string Name { get; private set; } = null!;

    public static Game Create(string name)
    {
        return new()
        {
            Name = name
        };
    }

    public void Update(string name)
    {
        if (Name == name)
        {
            return;
        }
        Name = name;
    }
}
