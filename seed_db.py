import os
import psycopg2
from psycopg2.extras import execute_values

def seed_db():
    # Database connection parameters from environment variables
    db_host = os.getenv('DB_HOST', 'localhost')
    db_name = os.getenv('DB_NAME', 'linuxdle')
    db_user = os.getenv('DB_USER', 'linuxdle')
    db_password = os.getenv('DB_PASSWORD', 'linuxdle')
    db_port = os.getenv('DB_PORT', '5432')

    try:
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port
        )
        cur = conn.cursor()

        print("Clearing existing data...")
        tables_to_truncate = [
            "daily_puzzles",
            "daily_command_daily_command_category",
            "daily_commands",
            "daily_command_categories",
            "desktop_environment_screenshots",
            "daily_desktop_environments",
            "daily_distros",
            "games"
        ]
        cur.execute(f"TRUNCATE TABLE {', '.join(tables_to_truncate)} CASCADE;")

        # Data for 'games'
        games_data = [
            (1, 'Commands'),
            (2, 'Distros'),
            (3, 'DE')
        ]
        print("Seeding 'games'...")
        execute_values(cur, "INSERT INTO games (id, name) VALUES %s", games_data)

        # Data for 'daily_distros'
        distros_data = [
            (1, 'Arch Linux', 'arch', 'assets/distros/arch.png', 'Independent', 'None', 2002),
            (2, 'Ubuntu', 'ubuntu', 'assets/distros/ubuntu.png', 'Debian', 'GNOME', 2004),
            (5, 'Linux Mint', 'mint', 'assets/distros/mint.png', 'Ubuntu', 'Cinnamon', 2006),
            (7, 'Alpine Linux', 'alpine', 'assets/distros/alpine.png', 'Independent', 'None', 2005),
            (8, 'Gentoo', 'gentoo', 'assets/distros/gentoo.png', 'Independent', 'None', 2000),
            (9, 'Slackware', 'slackware', 'assets/distros/slackware.png', 'Independent', 'None', 1993),
            (10, 'Manjaro', 'manjaro', 'assets/distros/manjaro.png', 'Arch Linux', 'Xfce', 2011),
            (3, 'Fedora', 'fedora', 'assets/distros/fedora.png', 'Independent', 'GNOME', 2003),
            (4, 'Debian', 'debian', 'assets/distros/debian.png', 'Independent', 'None', 1993),
            (6, 'openSUSE', 'opensuse', 'assets/distros/opensuse.png', 'Independent', 'KDE Plasma', 2005)
        ]
        print("Seeding 'daily_distros'...")
        execute_values(cur, "INSERT INTO daily_distros (id, name, slug, logo_path, base_distro, default_de, release_year) VALUES %s", distros_data)

        # Data for 'daily_desktop_environments'
        de_data = [
            (1, 'GNOME', 'gnome', 'DesktopEnvironment', 'Mutter', 'GUI / GSettings', 'Independent', 'C', 1999),
            (2, 'KDE Plasma', 'kde-plasma', 'DesktopEnvironment', 'KWin', 'GUI', 'Independent', 'C++', 1996),
            (6, 'Xfce', 'xfce', 'DesktopEnvironment', 'Xfwm4', 'GUI', 'Independent', 'C', 1996),
            (5, 'i3wm', 'i3', 'TilingWm', 'i3', 'Custom', 'Independent', 'C', 2009),
            (4, 'Sway', 'sway', 'TilingWm', 'Sway', 'Custom', 'wlroots-based', 'C', 2016),
            (7, 'bspwm', 'bspwm', 'TilingWm', 'bspwm', 'Shell', 'Independent', 'C', 2013),
            (9, 'AwesomeWM', 'awesome', 'TilingWm', 'Awesome', 'Lua', 'Independent', 'C', 2007),
            (10, 'Openbox', 'openbox', 'FloatingWm', 'Openbox', 'XML', 'Independent', 'C', 2002),
            (11, 'Cinnamon', 'cinnamon', 'DesktopEnvironment', 'Muffin', 'GUI / GSettings', 'GNOME-based', 'C', 2011),
            (13, 'LXQt', 'lxqt', 'DesktopEnvironment', 'Openbox', 'GUI', 'Independent', 'C++', 2014),
            (14, 'xmonad', 'xmonad', 'TilingWm', 'xmonad', 'Haskell', 'Independent', 'Haskell', 2007),
            (15, 'dwm', 'dwm', 'TilingWm', 'dwm', 'C', 'Independent', 'C', 2006),
            (8, 'Cosmic', 'cosmic', 'DesktopEnvironment', 'cosmic-comp', 'GUI', 'Independent', 'Rust', 2024),
            (3, 'Hyprland', 'hyprland', 'TilingWm', 'Hyprland', 'Custom', 'wlroots-based', 'C++', 2022),
            (12, 'MATE', 'mate', 'DesktopEnvironment', 'Marco', 'GUI', 'GNOME-based', 'C', 2011)
        ]
        print("Seeding 'daily_desktop_environments'...")
        execute_values(cur, "INSERT INTO daily_desktop_environments (id, name, slug, type, compositor, configuration_language, family, primary_language, release_year) VALUES %s", de_data)

        # Data for 'desktop_environment_screenshots'
        screenshots_data = [
            (1, 6, 'wwwroot/assets/des/xfce/xfce1.png', 'u/7ech0es7'),
            (2, 7, 'wwwroot/assets/des/bspwm/bspwm1.png', 'u/zby'),
            (3, 3, 'wwwroot/assets/des/hyprland/hyprland1.png', 'u/terpinedream'),
            (4, 4, 'wwwroot/assets/des/sway/sway1.png', 'u/CryptographerHappy77'),
            (5, 5, 'wwwroot/assets/des/i3/i31.png', 'u/konatamonogatari'),
            (6, 8, 'wwwroot/assets/des/cosmic/cosmic1.png', 'u/einlinus'),
            (7, 9, 'wwwroot/assets/des/awesome/awesome1.png', 'u/drxcosilver'),
            (8, 10, 'wwwroot/assets/des/openbox/openbox1.png', 'u/Jas_Sri'),
            (9, 1, 'wwwroot/assets/des/gnome/gnome1.png', 'u/Adventurous_Body2019'),
            (10, 2, 'wwwroot/assets/des/kde-plasma/kde-plasma1.png', 'u/jom4d4'),
            (59, 11, 'wwwroot/assets/des/cinnamon/cinnamon1.png', 'u/mint_nz'),
            (60, 13, 'wwwroot/assets/des/lxqt/lxqt1.png', 'u/lxqt_beauty'),
            (61, 14, 'wwwroot/assets/des/xmonad/xmonad1.png', 'u/soft_xmonad'),
            (62, 15, 'wwwroot/assets/des/dwm/dwm1.png', 'u/gruvbox_dwm'),
            (79, 12, 'wwwroot/assets/des/mate/mate1.png', 'u/mate_user')
        ]
        print("Seeding 'desktop_environment_screenshots'...")
        execute_values(cur, "INSERT INTO desktop_environment_screenshots (id, daily_desktop_environment_id, file_path, credit) VALUES %s", screenshots_data)

        # Data for 'daily_command_categories'
        categories_data = [
            (1, 'File System'),
            (2, 'File Manipulation'),
            (3, 'Text Processing'),
            (4, 'System Information'),
            (5, 'Process Management'),
            (6, 'Networking'),
            (7, 'Permissions'),
            (8, 'Archiving'),
            (9, 'User Management'),
            (10, 'Shell Built-in')
        ]
        print("Seeding 'daily_command_categories'...")
        execute_values(cur, "INSERT INTO daily_command_categories (id, name) VALUES %s", categories_data)

        # Data for 'daily_commands'
        commands_data = [
            (1, 'ls', 'coreutils', 1971, '1', False, False, True),
            (3, 'cd', 'shell-builtin', 1971, '1', True, False, True),
            (12, 'curl', 'curl', 1996, '1', False, True, False),
            (13, 'top', 'procps', 1984, '1', False, False, False),
            (14, 'ps', 'procps', 1971, '1', False, False, True),
            (15, 'kill', 'util-linux', 1971, '1', True, True, True),
            (18, 'mkdir', 'coreutils', 1971, '1', False, True, True),
            (48, 'chgrp', 'coreutils', 1971, '1', True, True, True),
            (49, 'uname', 'coreutils', 1971, '1', False, False, True),
            (50, 'whoami', 'coreutils', 1971, '1', False, False, True),
            (51, 'passwd', 'shadow', 1971, '1', False, False, True),
            (56, 'mount', 'util-linux', 1971, '8', False, False, True),
            (57, 'umount', 'util-linux', 1971, '8', False, True, True),
            (59, 'tail', 'coreutils', 1977, '1', False, True, True),
            (60, 'head', 'coreutils', 1971, '1', False, True, True),
            (41, 'rm', 'coreutils', 1971, '1', False, True, True),
            (42, 'mv', 'coreutils', 1971, '1', False, True, True),
            (43, 'cp', 'coreutils', 1971, '1', False, True, True),
            (44, 'wget', 'wget', 1996, '1', False, True, False),
            (45, 'htop', 'htop', 2004, '1', False, False, False),
            (46, 'nano', 'nano', 1999, '1', False, False, False),
            (47, 'vim', 'vim', 1991, '1', False, False, False),
            (68, 'gcc', 'gcc', 1987, '1', False, True, False),
            (69, 'make', 'make', 1976, '1', False, False, True),
            (70, 'docker', 'docker', 2013, '1', False, False, False),
            (52, 'systemctl', 'systemd', 2010, '1', False, True, False),
            (53, 'journalctl', 'systemd', 2010, '1', False, False, False),
            (54, 'rsync', 'rsync', 1996, '1', False, True, False),
            (55, 'git', 'git', 2005, '1', False, True, False),
            (75, 'lsblk', 'util-linux', 2010, '8', False, False, False),
            (16, 'df', 'coreutils', 1971, '1', False, False, True),
            (77, 'du', 'coreutils', 1971, '1', False, False, True),
            (10, 'ssh', 'openssh', 1995, '1', False, True, False),
            (11, 'ping', 'iputils', 1983, '8', False, True, False),
            (20, 'ip', 'iproute2', 1999, '8', False, True, False),
            (7, 'awk', 'gawk', 1977, '1', False, True, True),
            (8, 'sed', 'sed', 1974, '1', False, True, True),
            (2, 'grep', 'grep', 1973, '1', False, True, True),
            (17, 'cat', 'coreutils', 1971, '1', False, True, True),
            (58, 'less', 'less', 1984, '1', False, True, True),
            (6, 'find', 'findutils', 1971, '1', False, True, True),
            (4, 'chmod', 'coreutils', 1971, '1', False, True, True),
            (5, 'chown', 'coreutils', 1971, '1', False, True, True),
            (19, 'sudo', 'sudo', 1980, '8', False, True, False),
            (90, 'man', 'man-db', 1971, '1', False, True, True),
            (121, 'apt', 'apt', 1998, '8', False, True, False),
            (122, 'pacman', 'pacman', 2002, '8', False, True, False),
            (123, 'dnf', 'dnf', 2013, '8', False, True, False),
            (9, 'tar', 'tar', 1979, '1', False, True, True),
            (125, 'zip', 'zip', 1989, '1', False, True, False),
            (126, 'unzip', 'unzip', 1989, '1', False, True, False),
            (127, 'crontab', 'cron', 1975, '1', False, False, True),
            (128, 'at', 'at', 1979, '1', False, True, True),
            (129, 'bash', 'bash', 1989, '1', True, False, True),
            (130, 'zsh', 'zsh', 1990, '1', False, False, False),
            (131, 'alias', 'shell-builtin', 1971, '1', True, True, True),
            (132, 'export', 'shell-builtin', 1971, '1', True, True, True),
            (133, 'echo', 'coreutils', 1971, '1', True, True, True),
            (134, 'printf', 'coreutils', 1991, '1', True, True, True),
            (135, 'sleep', 'coreutils', 1971, '1', False, True, True),
            (136, 'exit', 'shell-builtin', 1971, '1', True, False, True)
        ]
        print("Seeding 'daily_commands'...")
        execute_values(cur, "INSERT INTO daily_commands (id, name, package, origin_year, man_section, is_built_in, requires_args, is_posix) VALUES %s", commands_data)

        # Data for 'daily_command_daily_command_category'
        cmd_cat_data = [
            (1, 1), (1, 3), (10, 3), (6, 12), (5, 13), (5, 14), (5, 15), (1, 18), (2, 18), (4, 49),
            (3, 59), (3, 60), (7, 48), (9, 50), (9, 51), (1, 56), (1, 57), (2, 41), (2, 42), (2, 43),
            (6, 44), (5, 45), (4, 45), (3, 46), (3, 47), (2, 68), (2, 69), (5, 70), (5, 52), (4, 53),
            (6, 54), (2, 55), (4, 75), (1, 75), (4, 16), (1, 16), (4, 77), (1, 77), (6, 10), (10, 10),
            (6, 11), (6, 20), (3, 7), (3, 8), (3, 2), (3, 17), (2, 17), (3, 58), (1, 6), (2, 6),
            (7, 4), (7, 5), (9, 19), (7, 19), (4, 90), (4, 121), (4, 122), (4, 123), (8, 9), (8, 125),
            (8, 126), (5, 127), (5, 128), (10, 129), (10, 130), (10, 131), (10, 132), (10, 133), (3, 133),
            (10, 134), (3, 134), (5, 135), (10, 136)
        ]
        print("Seeding 'daily_command_daily_command_category'...")
        execute_values(cur, "INSERT INTO daily_command_daily_command_category (categories_id, commands_id) VALUES %s", cmd_cat_data)

        # Fix Sequences
        print("Fixing sequences...")
        sequence_fixes = [
            "SELECT setval('games_id_seq', (SELECT MAX(id) FROM games));",
            "SELECT setval('daily_distros_id_seq', (SELECT MAX(id) FROM daily_distros));",
            "SELECT setval('daily_desktop_environments_id_seq', (SELECT MAX(id) FROM daily_desktop_environments));",
            "SELECT setval('desktop_environment_screenshots_id_seq', (SELECT MAX(id) FROM desktop_environment_screenshots));",
            "SELECT setval('daily_command_categories_id_seq', (SELECT MAX(id) FROM daily_command_categories));",
            "SELECT setval('daily_commands_id_seq', (SELECT MAX(id) FROM daily_commands));",
            "SELECT setval('daily_puzzles_id_seq', COALESCE((SELECT MAX(id) FROM daily_puzzles), 1));"
        ]
        for sql in sequence_fixes:
            cur.execute(sql)

        conn.commit()
        cur.close()
        conn.close()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_db()
