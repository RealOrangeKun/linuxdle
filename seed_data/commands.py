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
    """Seed the daily_commands table, resolving ID conflicts and updating metadata."""
    print("Seeding 'daily_commands'...")
    commands_data = get_commands_data()
    
    # 1. Fetch current commands in the database
    cur.execute("SELECT id, name FROM daily_commands")
    db_commands = cur.fetchall()
    
    # Map json commands by name
    json_by_name = {c[1]: c for c in commands_data}
    
    # 2. Identify ID mismatches
    mismatches = []
    for db_id, name in db_commands:
        if name in json_by_name:
            json_id = json_by_name[name][0]
            if db_id != json_id:
                mismatches.append((db_id, json_id, name))
                
    # 3. Resolve mismatches using 2-phase temp ID parking
    if mismatches:
        print(f"Found {len(mismatches)} command ID mismatches. Syncing IDs...")
        temp_id_map = {}
        for i, (db_id, json_id, name) in enumerate(mismatches):
            temp_id = -1000 - i
            temp_id_map[name] = temp_id
            
            # Delete dependent relations pointing to the old ID (will be re-seeded later)
            cur.execute("DELETE FROM daily_command_daily_command_category WHERE commands_id = %s", (db_id,))
            cur.execute("DELETE FROM command_infos WHERE command_id = %s", (db_id,))
            
            # Update daily_puzzles target_id
            cur.execute("UPDATE daily_puzzles SET target_id = %s WHERE target_id = %s AND game_id = 1", (temp_id, db_id))
            
            # Update user_guesses target_id
            cur.execute("UPDATE user_guesses SET target_id = %s WHERE target_id = %s AND game_id = 1", (temp_id, db_id))
            
            # Update command ID in daily_commands to the temp_id
            cur.execute("UPDATE daily_commands SET id = %s WHERE id = %s", (temp_id, db_id))
            
        for db_id, json_id, name in mismatches:
            temp_id = temp_id_map[name]
            
            # Update daily_puzzles target_id to the final correct ID
            cur.execute("UPDATE daily_puzzles SET target_id = %s WHERE target_id = %s AND game_id = 1", (json_id, temp_id))
            
            # Update user_guesses target_id to the final correct ID
            cur.execute("UPDATE user_guesses SET target_id = %s WHERE target_id = %s AND game_id = 1", (json_id, temp_id))
            
            # Update command ID in daily_commands to the final correct ID
            cur.execute("UPDATE daily_commands SET id = %s WHERE id = %s", (json_id, temp_id))

    # 4. Upsert all commands (insert new ones or update existing ones)
    for cmd in commands_data:
        cmd_id, name, package, origin_year, man_section, is_built_in, requires_args, is_posix = cmd
        cur.execute("""
            INSERT INTO daily_commands (id, name, package, origin_year, man_section, is_built_in, requires_args, is_posix)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                package = EXCLUDED.package,
                origin_year = EXCLUDED.origin_year,
                man_section = EXCLUDED.man_section,
                is_built_in = EXCLUDED.is_built_in,
                requires_args = EXCLUDED.requires_args,
                is_posix = EXCLUDED.is_posix
        """, cmd)

    # 5. Clean up any commands from the database that are no longer in the JSON
    json_names = list(json_by_name.keys())
    if json_names:
        cur.execute("SELECT id FROM daily_commands WHERE name NOT IN %s", (tuple(json_names),))
        to_delete_ids = [r[0] for r in cur.fetchall()]
        if to_delete_ids:
            print(f"Removing {len(to_delete_ids)} obsolete command(s) from database.")
            cur.execute("DELETE FROM daily_command_daily_command_category WHERE commands_id IN %s", (tuple(to_delete_ids),))
            cur.execute("DELETE FROM command_infos WHERE command_id IN %s", (tuple(to_delete_ids),))
            cur.execute("DELETE FROM daily_commands WHERE id IN %s", (tuple(to_delete_ids),))



def seed_command_categories_mapping(cur):
    """Seed the daily_command_daily_command_category mapping table."""
    print("Seeding 'daily_command_daily_command_category'...")
    cmd_cat_data = get_command_categories_mapping()
    execute_values(
        cur,
        "INSERT INTO daily_command_daily_command_category (categories_id, commands_id) VALUES %s ON CONFLICT DO NOTHING",
        cmd_cat_data
    )
