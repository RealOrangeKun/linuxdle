# Linuxdle Admin Console

Internal-only SQL admin console for Linuxdle PostgreSQL.

## Features
- Login-protected web page
- Run raw SQL queries (read/write)
- Preset query templates (today/tomorrow answers, recent guesses)

## Environment variables
- `ADMIN_USERNAME` (default: `admin`)
- `ADMIN_PASSWORD` (default: `change_me_now`) **must be overridden**
- `ADMIN_SECRET_KEY` (default dev fallback)
- `DB_HOST` (default: `postgres`)
- `DB_PORT` (default: `5432`)
- `DB_NAME` (default: `linuxdle`)
- `DB_USER` (default: `linuxdle`)
- `DB_PASSWORD` (default: `linuxdle`)

## Access
In compose, this service is bound to `127.0.0.1:5055`, so it is not exposed by Cloudflare/gateway.
Open: `http://127.0.0.1:5055`
