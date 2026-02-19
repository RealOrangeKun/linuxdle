using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Linuxdle.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyCommandAndCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "games",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.CreateTable(
                name: "daily_command_categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_daily_command_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "daily_commands",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    package = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    origin_year = table.Column<int>(type: "integer", nullable: false),
                    man_section = table.Column<int>(type: "integer", nullable: false),
                    is_built_in = table.Column<bool>(type: "boolean", nullable: false),
                    requires_args = table.Column<bool>(type: "boolean", nullable: false),
                    is_posix = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_daily_commands", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "daily_command_daily_command_category",
                columns: table => new
                {
                    categories_id = table.Column<int>(type: "integer", nullable: false),
                    commands_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_daily_command_daily_command_category", x => new { x.categories_id, x.commands_id });
                    table.ForeignKey(
                        name: "fk_daily_command_daily_command_category_daily_command_categori",
                        column: x => x.categories_id,
                        principalTable: "daily_command_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_daily_command_daily_command_category_daily_commands_command",
                        column: x => x.commands_id,
                        principalTable: "daily_commands",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_daily_command_daily_command_category_commands_id",
                table: "daily_command_daily_command_category",
                column: "commands_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "daily_command_daily_command_category");

            migrationBuilder.DropTable(
                name: "daily_command_categories");

            migrationBuilder.DropTable(
                name: "daily_commands");

            migrationBuilder.InsertData(
                table: "games",
                columns: new[] { "id", "name" },
                values: new object[] { 1, "Guess Daily Command" });
        }
    }
}
