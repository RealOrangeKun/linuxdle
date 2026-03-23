using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Linuxdle.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserGiveUp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_give_ups",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    puzzle_id = table.Column<int>(type: "integer", nullable: false),
                    game_id = table.Column<int>(type: "integer", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_give_ups", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_give_ups_daily_puzzles_puzzle_id",
                        column: x => x.puzzle_id,
                        principalTable: "daily_puzzles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_give_ups_games_game_id",
                        column: x => x.game_id,
                        principalTable: "games",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_give_ups_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_user_give_ups_game_id_date",
                table: "user_give_ups",
                columns: new[] { "game_id", "date" });

            migrationBuilder.CreateIndex(
                name: "ix_user_give_ups_puzzle_id_date",
                table: "user_give_ups",
                columns: new[] { "puzzle_id", "date" });

            migrationBuilder.CreateIndex(
                name: "ix_user_give_ups_user_id_date",
                table: "user_give_ups",
                columns: new[] { "user_id", "date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_give_ups");
        }
    }
}
