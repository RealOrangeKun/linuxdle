using Linuxdle.Domain.DailyCommands;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class CommandInfoConfiguration
    : IEntityTypeConfiguration<CommandInfo>
{
    public void Configure(EntityTypeBuilder<CommandInfo> builder)
    {
        builder
            .HasKey(ci => ci.Id);

        builder
            .HasIndex(ci => ci.CommandId)
            .IsUnique();

        builder
            .HasOne(ci => ci.Command)
            .WithOne(dc => dc.Info)
            .HasForeignKey<CommandInfo>(ci => ci.CommandId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .Property(ci => ci.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder
            .Property(ci => ci.Synopsis)
            .IsRequired()
            .HasMaxLength(300);

        builder
            .Property(ci => ci.Example)
            .IsRequired()
            .HasMaxLength(300);

        builder
            .Property(ci => ci.FunFact)
            .IsRequired()
            .HasMaxLength(1000);
    }
}
