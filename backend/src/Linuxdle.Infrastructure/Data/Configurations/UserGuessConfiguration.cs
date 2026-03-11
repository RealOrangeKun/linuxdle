using Linuxdle.Domain.UserGuesses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class UserGuessConfiguration : IEntityTypeConfiguration<UserGuess>
{
    public void Configure(EntityTypeBuilder<UserGuess> builder)
    {
        builder.HasKey(ug => ug.Id);

        builder.Property(ug => ug.UserId)
            .IsRequired();

        builder.Property(ug => ug.PuzzleId)
            .IsRequired();

        builder.Property(ug => ug.GameId)
            .IsRequired();

        builder.Property(ug => ug.TargetId)
            .IsRequired();

        builder.Property(ug => ug.Date)
            .IsRequired();

        builder.Property(ug => ug.IsCorrect)
            .IsRequired();

        builder.HasIndex(ug => new { ug.UserId, ug.Date });

        builder.HasIndex(ug => new { ug.PuzzleId, ug.TargetId, ug.Date });

        builder.HasIndex(ug => new { ug.GameId, ug.Date, ug.IsCorrect });

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
