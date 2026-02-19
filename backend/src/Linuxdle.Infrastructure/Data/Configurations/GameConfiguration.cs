using Linuxdle.Domain.Games;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder
            .HasKey(g => g.Id);

        builder
            .Property(g => g.Id)
            .ValueGeneratedOnAdd();

        builder
            .HasIndex(g => g.Name)
            .IsUnique();
    }
}
