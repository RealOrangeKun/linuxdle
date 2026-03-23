using Linuxdle.Domain.DailyCommands;
using Linuxdle.Domain.DailyDesktopEnvironments;
using Linuxdle.Domain.DailyDistros;
using Linuxdle.Domain.DailyPuzzles;
using Linuxdle.Domain.Games;
using Linuxdle.Domain.UserGuesses;
using Linuxdle.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace Linuxdle.Infrastructure.Data;

public sealed class LinuxdleDbContext(DbContextOptions<LinuxdleDbContext> options) : DbContext(options)
{
    public DbSet<Game> Games { get; set; }
    public DbSet<DailyPuzzle> DailyPuzzles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<DailyCommand> DailyCommands { get; set; }
    public DbSet<DailyCommandCategory> DailyCommandCategories { get; set; }
    public DbSet<DailyDistro> DailyDistros { get; set; }
    public DbSet<DailyDesktopEnvironment> DailyDesktopEnvironments { get; set; }
    public DbSet<DesktopEnvironmentScreenshot> DesktopEnvironmentScreenshots { get; set; }
    public DbSet<UserGuess> UserGuesses { get; set; }
    public DbSet<Linuxdle.Domain.UserGiveUps.UserGiveUp> UserGiveUps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LinuxdleDbContext).Assembly);
    }
}
