using System.Data;
using Linuxdle.Domain.DailyCommands;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class DailyCommandConfiguration
    : IEntityTypeConfiguration<DailyCommand>
{
    public void Configure(EntityTypeBuilder<DailyCommand> builder)
    {
        builder
            .HasKey(dc => dc.Id);

        builder
            .HasMany(dc => dc.Categories)
            .WithMany(c => c.Commands);

        builder
            .Property(dc => dc.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder
            .Property(dc => dc.Package)
            .IsRequired()
            .HasMaxLength(100);

        builder
            .Property(dc => dc.OriginYear)
            .IsRequired();

        builder
            .Property(dc => dc.ManSection)
            .IsRequired();

        builder
            .Property(dc => dc.IsBuiltIn)
            .IsRequired();

        builder
            .Property(dc => dc.RequiresArgs)
            .IsRequired();

        builder
            .Property(dc => dc.IsPosix)
            .IsRequired();
    }
}
