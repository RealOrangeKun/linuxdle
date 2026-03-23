using Linuxdle.Domain.UserGiveUps;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class UserGiveUpConfiguration : IEntityTypeConfiguration<UserGiveUp>
{
    public void Configure(EntityTypeBuilder<UserGiveUp> builder)
    {
        builder.HasKey(ug => ug.Id);

        builder.Property(ug => ug.UserId)
            .IsRequired();

        builder.Property(ug => ug.PuzzleId)
            .IsRequired();

        builder.Property(ug => ug.GameId)
            .IsRequired();

        builder.Property(ug => ug.Date)
            .IsRequired();

        builder.HasIndex(ug => new { ug.UserId, ug.Date });

        builder.HasIndex(ug => new { ug.PuzzleId, ug.Date });

        builder.HasIndex(ug => new { ug.GameId, ug.Date });

        builder
            .HasOne(ug => ug.User)
            .WithMany()
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(ug => ug.Game)
            .WithMany()
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(ug => ug.Puzzle)
            .WithMany()
            .OnDelete(DeleteBehavior.Cascade);
    }
}
