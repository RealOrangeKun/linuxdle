using System;
using Linuxdle.Domain.DailyDesktopEnvironments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class DesktopEnvironmentScreenshotConfiguration : IEntityTypeConfiguration<DesktopEnvironmentScreenshot>
{
    public void Configure(EntityTypeBuilder<DesktopEnvironmentScreenshot> builder)
    {
        builder
            .HasKey(des => des.Id);

        builder
            .Property(des => des.DailyDesktopEnvironmentId)
            .IsRequired();

        builder
            .Property(des => des.FilePath)
            .IsRequired()
            .HasMaxLength(255);

        builder
            .Property(des => des.Credit)
            .IsRequired()
            .HasMaxLength(200);
    }
}
