"""Main database seeding script for Linuxdle."""
from seed_data.database import get_connection, clear_tables, fix_sequences
from seed_data.games import seed_games
from seed_data.distros import seed_distros
from seed_data.desktop_environments import seed_desktop_environments, seed_screenshots
from seed_data.commands import seed_categories, seed_commands, seed_command_categories_mapping


def seed_db():
    """Seed the database with all game data."""
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Clear all existing data
        clear_tables(cur)

        # Seed each game type
        seed_games(cur)
        seed_distros(cur)
        seed_desktop_environments(cur)
        seed_screenshots(cur)
        seed_categories(cur)
        seed_commands(cur)
        seed_command_categories_mapping(cur)

        # Fix sequences
        fix_sequences(cur)

        conn.commit()
        cur.close()
        conn.close()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_db()
