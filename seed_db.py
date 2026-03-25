"""Main database seeding script for Linuxdle."""
import os
import redis
from seed_data.database import get_connection, clear_tables, fix_sequences
from seed_data.games import seed_games
from seed_data.distros import seed_distros
from seed_data.desktop_environments import seed_desktop_environments, seed_screenshots
from seed_data.commands import seed_categories, seed_commands, seed_command_categories_mapping


PREFIX = "Linuxdle_"

# Cache keys per data type — only flush what's relevant to what was seeded
CACHE_KEYS_BY_TYPE = {
    "games":                [f"{PREFIX}all_game_ids"],
    "distros":              [f"{PREFIX}all_distros",              f"{PREFIX}2_target_ids"],
    "commands":             [f"{PREFIX}all_command_names",        f"{PREFIX}1_target_ids"],
    "desktop_environments": [f"{PREFIX}all_desktop_environments", f"{PREFIX}3_target_ids"],
}


def clear_cache(*seeded_types):
    """Flush only the Redis keys relevant to the given seeded data types."""
    keys = []
    for t in seeded_types:
        keys.extend(CACHE_KEYS_BY_TYPE.get(t, []))

    if not keys:
        return

    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))
    redis_password = os.getenv("REDIS_PASSWORD", None)

    try:
        r = redis.Redis(host=redis_host, port=redis_port, password=redis_password, decode_responses=True)
        deleted = r.delete(*keys)
        print(f"Cache cleared: {deleted}/{len(keys)} key(s) deleted {keys}.")
    except Exception as e:
        print(f"Warning: could not clear Redis cache: {e}")


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

        # Clear only the cache keys relevant to what was seeded
        clear_cache("games", "distros", "commands", "desktop_environments")

    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_db()
