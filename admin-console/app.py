import os
from typing import Any

import psycopg2
from flask import Flask, jsonify, redirect, render_template, request, session, url_for

app = Flask(__name__)
app.secret_key = os.getenv("ADMIN_SECRET_KEY", "linuxdle_admin_dev_secret")


def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "postgres"),
        database=os.getenv("DB_NAME", "linuxdle"),
        user=os.getenv("DB_USER", "linuxdle"),
        password=os.getenv("DB_PASSWORD", "linuxdle"),
        port=os.getenv("DB_PORT", "5432"),
    )


def is_logged_in() -> bool:
    return bool(session.get("is_admin"))


def execute_sql(sql: str) -> dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(sql)

        if cur.description:
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            conn.commit()
            return {
                "mode": "result",
                "columns": columns,
                "rows": rows,
                "message": f"Query executed successfully. {len(rows)} row(s) returned.",
            }

        conn.commit()
        return {
            "mode": "write",
            "columns": [],
            "rows": [],
            "message": f"Query executed successfully. {cur.rowcount} row(s) affected.",
        }
    finally:
        cur.close()
        conn.close()


PRESET_QUERIES = {
    "today_answers": """SELECT\n    g.id AS game_id,\n    g.name AS game_name,\n    dp.scheduled_date,\n    CASE\n        WHEN dp.game_id = 1 THEN (SELECT c.name FROM daily_commands c WHERE c.id = dp.target_id)\n        WHEN dp.game_id = 2 THEN (SELECT d.name FROM daily_distros d WHERE d.id = dp.target_id)\n        WHEN dp.game_id = 3 THEN (SELECT de.name FROM daily_desktop_environments de WHERE de.id = dp.target_id)\n        ELSE '[unknown]'\n    END AS answer\nFROM daily_puzzles dp\nJOIN games g ON g.id = dp.game_id\nWHERE dp.scheduled_date = CURRENT_DATE\nORDER BY g.id;""",
    "tomorrow_answers": """SELECT\n    g.id AS game_id,\n    g.name AS game_name,\n    dp.scheduled_date,\n    CASE\n        WHEN dp.game_id = 1 THEN (SELECT c.name FROM daily_commands c WHERE c.id = dp.target_id)\n        WHEN dp.game_id = 2 THEN (SELECT d.name FROM daily_distros d WHERE d.id = dp.target_id)\n        WHEN dp.game_id = 3 THEN (SELECT de.name FROM daily_desktop_environments de WHERE de.id = dp.target_id)\n        ELSE '[unknown]'\n    END AS answer\nFROM daily_puzzles dp\nJOIN games g ON g.id = dp.game_id\nWHERE dp.scheduled_date = CURRENT_DATE + 1\nORDER BY g.id;""",
    "recent_user_guesses": """SELECT\n    ug.id,\n    ug.user_id,\n    ug.puzzle_id,\n    ug.game_id,\n    ug.target_id,\n    ug.date,\n    ug.is_correct\nFROM user_guesses ug\nORDER BY ug.date DESC, ug.id DESC\nLIMIT 100;""",
}

SQL_SNIPPETS = {
    "select_all": "SELECT *\nFROM table_name\nLIMIT 100;",
    "select_where": "SELECT *\nFROM table_name\nWHERE column_name = 'value'\nLIMIT 100;",
    "insert": "INSERT INTO table_name (column_1, column_2)\nVALUES ('value_1', 'value_2');",
    "update": "UPDATE table_name\nSET column_name = 'new_value'\nWHERE id = 1;",
    "delete": "DELETE FROM table_name\nWHERE id = 1;",
    "join": "SELECT a.*, b.*\nFROM table_a a\nJOIN table_b b ON b.a_id = a.id\nLIMIT 100;",
    "create_index": "CREATE INDEX idx_table_column\nON table_name (column_name);",
}

SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "GROUP BY", "ORDER BY",
    "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE", "LIMIT", "COUNT(*)"
]


def get_table_names() -> list[str]:
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
            """
        )
        return [row[0] for row in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


@app.route("/login", methods=["GET", "POST"])
def login():
    if is_logged_in():
        return redirect(url_for("index"))

    error_message = None

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")

        expected_username = os.getenv("ADMIN_USERNAME", "admin")
        expected_password = os.getenv("ADMIN_PASSWORD", "change_me_now")

        if username == expected_username and password == expected_password:
            session["is_admin"] = True
            return redirect(url_for("index"))

        error_message = "Invalid credentials"

    return render_template("login.html", error_message=error_message)


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/", methods=["GET", "POST"])
def index():
    if not is_logged_in():
        return redirect(url_for("login"))

    result = None
    error_message = None
    sql_text = PRESET_QUERIES["today_answers"]
    selected_preset = "today_answers"

    if request.method == "POST":
        selected_preset = request.form.get("selected_preset", "custom")
        sql_text = request.form.get("sql", "").strip()

        if not sql_text:
            error_message = "SQL query is required"
        else:
            try:
                result = execute_sql(sql_text)
            except Exception as exc:
                error_message = str(exc)

    return render_template(
        "index.html",
        result=result,
        error_message=error_message,
        sql_text=sql_text,
        selected_preset=selected_preset,
        presets=PRESET_QUERIES,
        snippets=SQL_SNIPPETS,
        keywords=SQL_KEYWORDS,
    )


@app.route("/api/suggestions", methods=["GET"])
def get_suggestions():
    if not is_logged_in():
        return jsonify({"error": "Unauthorized"}), 401

    try:
        tables = get_table_names()
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify(
        {
            "tables": tables,
            "snippets": SQL_SNIPPETS,
            "keywords": SQL_KEYWORDS,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
