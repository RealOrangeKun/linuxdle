using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Linuxdle.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyDesktopEnvironments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "daily_desktop_environments",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    compositor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_daily_desktop_environments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "desktop_environment_screenshots",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    daily_desktop_environment_id = table.Column<int>(type: "integer", nullable: false),
                    file_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    credit = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_desktop_environment_screenshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_desktop_environment_screenshots_daily_desktop_environments_",
                        column: x => x.daily_desktop_environment_id,
                        principalTable: "daily_desktop_environments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_daily_desktop_environments_slug",
                table: "daily_desktop_environments",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_desktop_environment_screenshots_daily_desktop_environment_id",
                table: "desktop_environment_screenshots",
                column: "daily_desktop_environment_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "desktop_environment_screenshots");

            migrationBuilder.DropTable(
                name: "daily_desktop_environments");
        }
    }
}
