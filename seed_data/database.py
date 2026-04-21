"""Database connection utilities for seeding."""
import os
import psycopg2
from psycopg2.extras import execute_values


def get_connection():
    """Get a database connection using environment variables."""
    db_host = os.getenv('DB_HOST', 'localhost')
    db_name = os.getenv('DB_NAME', 'linuxdle')
    db_user = os.getenv('DB_USER', 'linuxdle')
    db_password = os.getenv('DB_PASSWORD', 'linuxdle')
    db_port = os.getenv('DB_PORT', '5432')

    return psycopg2.connect(
        host=db_host,
        database=db_name,
        user=db_user,
        password=db_password,
        port=db_port
    )


def clear_tables(cur):
    """Clear all tables before seeding. Preserves yesterday and today in daily_puzzles."""
    print("Clearing existing data...")
    tables_to_truncate = [
        "command_infos",
        "daily_command_daily_command_category",
        "daily_commands",
        "daily_command_categories",
        "desktop_environment_screenshots",
        "daily_desktop_environments",
        "daily_distros",
        "games"
    ]
    cur.execute(f"TRUNCATE TABLE {', '.join(tables_to_truncate)} CASCADE;")
    # Remove old puzzle entries but keep yesterday and today so the game keeps working
    cur.execute("""
        DELETE FROM daily_puzzles
        WHERE scheduled_date < CURRENT_DATE - INTERVAL '1 day'
    """)


def fix_sequences(cur):
    """Fix database sequences after seeding."""
    print("Fixing sequences...")
    sequence_fixes = [
        "SELECT setval('games_id_seq', (SELECT MAX(id) FROM games));",
        "SELECT setval('daily_distros_id_seq', (SELECT MAX(id) FROM daily_distros));",
        "SELECT setval('daily_desktop_environments_id_seq', (SELECT MAX(id) FROM daily_desktop_environments));",
        "SELECT setval('desktop_environment_screenshots_id_seq', (SELECT MAX(id) FROM desktop_environment_screenshots));",
        "SELECT setval('daily_command_categories_id_seq', (SELECT MAX(id) FROM daily_command_categories));",
        "SELECT setval('daily_commands_id_seq', (SELECT MAX(id) FROM daily_commands));",
        "SELECT setval('command_infos_id_seq', COALESCE((SELECT MAX(id) FROM command_infos), 1));",
        "SELECT setval('daily_puzzles_id_seq', COALESCE((SELECT MAX(id) FROM daily_puzzles), 1));"
    ]
    for sql in sequence_fixes:
        cur.execute(sql)
