"""Seed data for daily_desktop_environments and screenshots tables."""
import json
import os
from psycopg2.extras import execute_values


def get_desktop_environments_data():
    """Return desktop environments seed data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'desktop_environments.json')
    with open(data_path, 'r') as f:
        des = json.load(f)
    return [
        (d['id'], d['name'], d['slug'], d['type'], d['compositor'], d['configuration_language'], d['family'], d['primary_language'], d['release_year'])
        for d in des
    ]


def get_screenshots_data():
    """Return desktop environment screenshots seed data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'screenshots.json')
    with open(data_path, 'r') as f:
        screenshots = json.load(f)
    return [
        (s['id'], s['daily_desktop_environment_id'], s['file_path'], s['credit'])
        for s in screenshots
    ]


def seed_desktop_environments(cur):
    """Seed the daily_desktop_environments table."""
    print("Seeding 'daily_desktop_environments'...")
    de_data = get_desktop_environments_data()
    execute_values(
        cur,
        "INSERT INTO daily_desktop_environments (id, name, slug, type, compositor, configuration_language, family, primary_language, release_year) VALUES %s",
        de_data
    )


def seed_screenshots(cur):
    """Seed the desktop_environment_screenshots table."""
    print("Seeding 'desktop_environment_screenshots'...")
    screenshots_data = get_screenshots_data()
    execute_values(
        cur,
        "INSERT INTO desktop_environment_screenshots (id, daily_desktop_environment_id, file_path, credit) VALUES %s",
        screenshots_data
    )
