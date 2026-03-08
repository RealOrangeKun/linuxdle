using Linuxdle.Domain.DailyDesktopEnvironments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class DailyDesktopEnvironmentConfiguration : IEntityTypeConfiguration<DailyDesktopEnvironment>
{
    public void Configure(EntityTypeBuilder<DailyDesktopEnvironment> builder)
    {
        builder
            .HasKey(dde => dde.Id);

        builder
            .HasIndex(dde => dde.Slug)
            .IsUnique();

        builder
            .HasMany(dde => dde.DesktopEnvironmentScreenshots)
            .WithOne()
            .HasForeignKey(des => des.DailyDesktopEnvironmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .Property(dde => dde.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder
            .Property(dde => dde.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder
            .Property(dde => dde.Type)
            .HasConversion<string>()
            .IsRequired();

        builder
            .Property(dde => dde.Compositor)
            .IsRequired()
            .HasMaxLength(100);

        builder
            .Property(dde => dde.Family)
            .IsRequired()
            .HasMaxLength(100);

        builder
            .Property(dde => dde.ConfigurationLanguage)
            .IsRequired()
            .HasMaxLength(100);

        builder
            .Property(dde => dde.ReleaseYear)
            .IsRequired();

        builder
            .Property(dde => dde.PrimaryLanguage)
            .IsRequired()
            .HasMaxLength(100);
    }
}
