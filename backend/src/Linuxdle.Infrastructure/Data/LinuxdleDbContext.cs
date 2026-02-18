using Microsoft.EntityFrameworkCore;

namespace Linuxdle.Infrastructure.Data;

internal sealed class LinuxdleDbContext(DbContextOptions<LinuxdleDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


    }
}
