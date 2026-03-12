# Seed Data Structure

This directory contains modular seed data for the Linuxdle database, organized by game type. **All data is stored in JSON files** for easy editing without touching Python code.

## Directory Structure

```
seed_data/
├── __init__.py                  # Package initialization
├── database.py                  # Database connection and utilities
├── games.py                     # Games table seeding logic
├── distros.py                   # Distros game seeding logic
├── desktop_environments.py      # Desktop Environments seeding logic
├── commands.py                  # Commands game seeding logic
├── data/                        # JSON data files
│   ├── games.json
│   ├── distros.json
│   ├── desktop_environments.json
│   ├── screenshots.json
│   ├── categories.json
│   ├── commands.json
│   └── command_categories.json
└── README.md                    # This file
```

## Usage

Run the main seed script from the project root:

```bash
python seed_db.py
```

## Adding New Data

All data is stored in JSON files in the `data/` folder. Simply edit the appropriate JSON file and run the seed script.

### Adding a New Distro

Edit [data/distros.json](data/distros.json) and add a new object:

```json
{
  "id": 11,
  "name": "NixOS",
  "slug": "nixos",
  "logo_path": "assets/distros/nixos.png",
  "base_distro": "Independent",
  "default_de": "None",
  "release_year": 2003
}
```

### Adding a New Desktop Environment

Edit [data/desktop_environments.json](data/desktop_environments.json):

```json
{
  "id": 16,
  "name": "Enlightenment",
  "slug": "enlightenment",
  "type": "DesktopEnvironment",
  "compositor": "Enlightenment",
  "configuration_language": "GUI",
  "family": "Independent",
  "primary_language": "C",
  "release_year": 1997
}
```

Then add screenshot(s) to [data/screenshots.json](data/screenshots.json):

```json
{
  "id": 84,
  "daily_desktop_environment_id": 16,
  "file_path": "wwwroot/assets/des/enlightenment/enlightenment1.png",
  "credit": "u/username"
}
```

### Adding a New Command

Edit [data/commands.json](data/commands.json):

```json
{
  "id": 137,
  "name": "tmux",
  "package": "tmux",
  "origin_year": 2007,
  "man_section": "1",
  "is_built_in": false,
  "requires_args": true,
  "is_posix": false
}
```

Then add category mappings to [data/command_categories.json](data/command_categories.json):

```json
{"category_id": 5, "command_id": 137},
{"category_id": 10, "command_id": 137}
```

### Adding a New Category

If you need to add a new command category, edit [data/categories.json](data/categories.json):

```json
{
  "id": 11,
  "name": "Multiplexers"
}
```

Then map commands to this category in [data/command_categories.json](data/command_categories.json).

## Data Format Reference

### Games ([data/games.json](data/games.json))
```json
{
  "id": number,
  "name": string
}
```

### Distros ([data/distros.json](data/distros.json))
```json
{
  "id": number,
  "name": string,
  "slug": string,
  "logo_path": string,
  "base_distro": string,
  "default_de": string,
  "release_year": number
}
```

### Desktop Environments ([data/desktop_environments.json](data/desktop_environments.json))
```json
{
  "id": number,
  "name": string,
  "slug": string,
  "type": string,
  "compositor": string,
  "configuration_language": string,
  "family": string,
  "primary_language": string,
  "release_year": number
}
```

### Screenshots ([data/screenshots.json](data/screenshots.json))
```json
{
  "id": number,
  "daily_desktop_environment_id": number,
  "file_path": string,
  "credit": string
}
```

### Commands ([data/commands.json](data/commands.json))
```json
{
  "id": number,
  "name": string,
  "package": string,
  "origin_year": number,
  "man_section": string,
  "is_built_in": boolean,
  "requires_args": boolean,
  "is_posix": boolean
}
```

### Categories ([data/categories.json](data/categories.json))
```json
{
  "id": number,
  "name": string
}
```

### Command-Category Mapping ([data/command_categories.json](data/command_categories.json))
```json
{
  "category_id": number,
  "command_id": number
}
```

## Environment Variables

The database connection can be configured using environment variables:

- `DB_HOST` (default: `localhost`)
- `DB_NAME` (default: `linuxdle`)
- `DB_USER` (default: `linuxdle`)
- `DB_PASSWORD` (default: `linuxdle`)
- `DB_PORT` (default: `5432`)
