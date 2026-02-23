using Linuxdle.Domain.DailyDistros;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class DailyDistroConfiguration : IEntityTypeConfiguration<DailyDistro>
{
    public void Configure(EntityTypeBuilder<DailyDistro> builder)
    {
        builder
            .HasKey(dd => dd.Id);

        builder
            .HasIndex(dd => dd.Slug)
            .IsUnique();

        builder
            .Property(dd => dd.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder
            .Property(dd => dd.Slug)
            .HasMaxLength(100)
            .IsRequired();

        builder
            .Property(dd => dd.LogoPath)
            .HasMaxLength(255)
            .IsRequired();

        builder
            .Property(dd => dd.BaseDistro)
            .HasMaxLength(100)
            .IsRequired();

        builder
            .Property(dd => dd.DefaultDe)
            .HasMaxLength(100)
            .IsRequired();

        builder
            .Property(dd => dd.ReleaseYear)
            .IsRequired();
    }
}
