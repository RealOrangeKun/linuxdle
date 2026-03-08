using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Linuxdle.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyDesktopEnvironmentHints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "configuration_language",
                table: "daily_desktop_environments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "family",
                table: "daily_desktop_environments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "primary_language",
                table: "daily_desktop_environments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "release_year",
                table: "daily_desktop_environments",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "configuration_language",
                table: "daily_desktop_environments");

            migrationBuilder.DropColumn(
                name: "family",
                table: "daily_desktop_environments");

            migrationBuilder.DropColumn(
                name: "primary_language",
                table: "daily_desktop_environments");

            migrationBuilder.DropColumn(
                name: "release_year",
                table: "daily_desktop_environments");
        }
    }
}
