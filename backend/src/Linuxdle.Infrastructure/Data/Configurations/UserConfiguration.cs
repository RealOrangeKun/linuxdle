using Linuxdle.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linuxdle.Infrastructure.Data.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder
            .HasKey(u => u.Id);

        builder
            .Property(u => u.RefreshToken)
            .HasMaxLength(64)
            .IsRequired();

        builder
            .Property(u => u.CreatedAt)
            .IsRequired();

        builder
            .Property(u => u.LastRefreshAt)
            .IsRequired();

        builder
            .Property(u => u.ExpiresAt)
            .IsRequired();

        builder
            .Property(u => u.CurrentStreak)
            .IsRequired()
            .HasDefaultValue(0);

        builder
            .Property(u => u.LastCompletedDate);

        builder
            .ToTable(t => t
                .HasCheckConstraint(
                    "ck_user_expiration_valid",
                    "expires_at > last_refresh_at"));
    }
}
