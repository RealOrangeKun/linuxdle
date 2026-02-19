using Linuxdle.Domain.DailyPuzzles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class DailyPuzzleConfiguration : IEntityTypeConfiguration<DailyPuzzle>
{
    public void Configure(EntityTypeBuilder<DailyPuzzle> builder)
    {
        builder
            .HasKey(dp => dp.Id);

        builder
            .Property(dp => dp.Id)
            .ValueGeneratedOnAdd();

        builder
            .Property(dp => dp.TargetId)
            .IsRequired();

        builder
            .Property(dp => dp.ScheduledDate)
            .IsRequired();

        builder
            .HasIndex(dp => new { dp.GameId, dp.ScheduledDate })
            .IsUnique();

        builder
            .HasOne(dp => dp.Game)
            .WithMany()
            .OnDelete(DeleteBehavior.Cascade)
            .HasForeignKey(dp => dp.GameId);
    }
}
