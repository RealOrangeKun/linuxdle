"""Seed data for the command_info table."""

import json
import os
from psycopg2.extras import execute_values


def get_command_info_data():
    """Return command info seed data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), "data", "command_info.json")
    with open(data_path, "r") as f:
        infos = json.load(f)
    return [
        (i["command_id"], i["description"], i["synopsis"], i["example"], i["fun_fact"])
        for i in infos
    ]


def seed_command_info(cur):
    """Seed the command_info table."""
    print("Seeding 'command_info'...")
    data = get_command_info_data()
    execute_values(
        cur,
        """
        INSERT INTO command_infos (command_id, description, synopsis, example, fun_fact)
        VALUES %s
        ON CONFLICT (command_id) DO UPDATE SET
            description = EXCLUDED.description,
            synopsis = EXCLUDED.synopsis,
            example = EXCLUDED.example,
            fun_fact = EXCLUDED.fun_fact
        """,
        data,
    )
