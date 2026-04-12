"""Main database seeding script for Linuxdle."""
import os
import redis
from seed_data.database import get_connection, fix_sequences
from seed_data.games import seed_games
from seed_data.distros import seed_distros
from seed_data.desktop_environments import seed_desktop_environments, seed_screenshots
from seed_data.commands import seed_categories, seed_commands, seed_command_categories_mapping


# Keep this aligned with backend/src/Linuxdle.Services/Common/Constants/CacheKeys.cs
CACHE_KEYS_BY_TYPE = {
    "games": ["all_game_ids"],
    "distros": ["all_distros"],
    "commands": ["all_command_names"],
    "desktop_environments": ["all_desktop_environments"],
}

CACHE_PATTERNS = [
    "daily_distro_target_*",
    "daily_command_target_*",
    "daily_de_target_*",
    "daily_distro_image_*",
    "daily_de_screenshot_*",
    "distro_*",
    "command_*",
    "de_*",
]


def clear_cache(*seeded_types):
    """Flush Redis keys that can become stale after seed updates."""
    keys = []
    for t in seeded_types:
        keys.extend(CACHE_KEYS_BY_TYPE.get(t, []))

    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))
    redis_password = os.getenv("REDIS_PASSWORD", None)

    try:
        r = redis.Redis(host=redis_host, port=redis_port, password=redis_password, decode_responses=True)

        # Include pattern-based keys to invalidate date-based and entity caches.
        for pattern in CACHE_PATTERNS:
            keys.extend(r.scan_iter(match=pattern, count=500))

        unique_keys = sorted(set(keys))
        if not unique_keys:
            print("Cache clear skipped: no matching keys found.")
            return

        deleted = r.delete(*unique_keys)
        print(f"Cache cleared: {deleted}/{len(unique_keys)} key(s) deleted.")
    except Exception as e:
        print(f"Warning: could not clear Redis cache: {e}")


def seed_db():
    """Seed the database with all game data in an idempotent way."""
    try:
        conn = get_connection()
        cur = conn.cursor()

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
        raise

if __name__ == "__main__":
    seed_db()
