using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Linuxdle.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserGuesses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_guesses",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    puzzle_id = table.Column<int>(type: "integer", nullable: false),
                    game_id = table.Column<int>(type: "integer", nullable: false),
                    target_id = table.Column<int>(type: "integer", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_guesses", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_guesses_daily_puzzles_puzzle_id",
                        column: x => x.puzzle_id,
                        principalTable: "daily_puzzles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_guesses_games_game_id",
                        column: x => x.game_id,
                        principalTable: "games",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_guesses_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_user_guesses_game_id_date_is_correct",
                table: "user_guesses",
                columns: new[] { "game_id", "date", "is_correct" });

            migrationBuilder.CreateIndex(
                name: "ix_user_guesses_puzzle_id_target_id_date",
                table: "user_guesses",
                columns: new[] { "puzzle_id", "target_id", "date" });

            migrationBuilder.CreateIndex(
                name: "ix_user_guesses_user_id_date",
                table: "user_guesses",
                columns: new[] { "user_id", "date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_guesses");
        }
    }
}
