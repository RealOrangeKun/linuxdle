"""Seed data for daily_distros table."""
import json
import os
from psycopg2.extras import execute_values


def get_distros_data():
    """Return distros seed data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'distros.json')
    with open(data_path, 'r') as f:
        distros = json.load(f)
    return [
        (d['id'], d['name'], d['slug'], d['logo_path'], d['base_distro'], d['default_de'], d['release_year'])
        for d in distros
    ]


def seed_distros(cur):
    """Seed the daily_distros table."""
    print("Seeding 'daily_distros'...")
    distros_data = get_distros_data()
    execute_values(
        cur,
        "INSERT INTO daily_distros (id, name, slug, logo_path, base_distro, default_de, release_year) VALUES %s",
        distros_data
    )
