"""Seed data for games table."""
import json
import os
from psycopg2.extras import execute_values


def get_games_data():
    """Return games seed data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'games.json')
    with open(data_path, 'r') as f:
        games = json.load(f)
    return [(g['id'], g['name']) for g in games]


def seed_games(cur):
    """Seed the games table."""
    print("Seeding 'games'...")
    games_data = get_games_data()
    execute_values(cur, "INSERT INTO games (id, name) VALUES %s", games_data)
