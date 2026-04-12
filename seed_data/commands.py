"""Seed data for daily_commands and command categories tables."""
import json
import os
from psycopg2.extras import execute_values


def get_categories_data():
    """Return command categories seed data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'categories.json')
    with open(data_path, 'r') as f:
        categories = json.load(f)
    return [(c['id'], c['name']) for c in categories]


def get_commands_data():
    """Return commands seed data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'commands.json')
    with open(data_path, 'r') as f:
        commands = json.load(f)
    return [
        (c['id'], c['name'], c['package'], c['origin_year'], c['man_section'], c['is_built_in'], c['requires_args'], c['is_posix'])
        for c in commands
    ]


def get_command_categories_mapping():
    """Return the mapping between commands and categories from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'command_categories.json')
    with open(data_path, 'r') as f:
        mappings = json.load(f)
    return [(m['category_id'], m['command_id']) for m in mappings]


def seed_categories(cur):
    """Seed the daily_command_categories table."""
    print("Seeding 'daily_command_categories'...")
    categories_data = get_categories_data()
    execute_values(
        cur,
        "INSERT INTO daily_command_categories (id, name) VALUES %s ON CONFLICT DO NOTHING",
        categories_data,
    )


def seed_commands(cur):
    """Seed the daily_commands table."""
    print("Seeding 'daily_commands'...")
    commands_data = get_commands_data()
    execute_values(
        cur,
        "INSERT INTO daily_commands (id, name, package, origin_year, man_section, is_built_in, requires_args, is_posix) VALUES %s ON CONFLICT DO NOTHING",
        commands_data
    )


def seed_command_categories_mapping(cur):
    """Seed the daily_command_daily_command_category mapping table."""
    print("Seeding 'daily_command_daily_command_category'...")
    cmd_cat_data = get_command_categories_mapping()
    execute_values(
        cur,
        "INSERT INTO daily_command_daily_command_category (categories_id, commands_id) VALUES %s ON CONFLICT DO NOTHING",
        cmd_cat_data
    )
