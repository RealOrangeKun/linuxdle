using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Linuxdle.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserStreak : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "current_streak",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateOnly>(
                name: "last_completed_date",
                table: "users",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "current_streak",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_completed_date",
                table: "users");
        }
    }
}
