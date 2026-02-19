using Linuxdle.Domain.DailyCommands;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class DailyCommandCategoryConfiguration
    : IEntityTypeConfiguration<DailyCommandCategory>
{
    public void Configure(EntityTypeBuilder<DailyCommandCategory> builder)
    {
        builder
            .HasKey(dcc => dcc.Id);

        builder
            .Property(dcc => dcc.Name)
            .IsRequired()
            .HasMaxLength(100);
    }
}
