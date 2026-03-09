# Linuxdle 🐧

Welcome to the **Linuxdle** project. This is a Wordle-inspired daily puzzle suite designed for Linux enthusiasts and power users.

## Project Overview
Linuxdle provides a collection of daily guessing games focused on the Linux ecosystem.

### Visual Style: Terminal Aesthetic
The application features a strictly flat, high-contrast **Terminal Aesthetic**:
- **Monospace Everywhere:** Enforced use of fonts like `Fira Code` and `JetBrains Mono`.
- **Shell-like Symbols:** Replaced emojis with prompt symbols (`_ >`, `[+]`, `[OK]`, `STATUS_OK`).
- **Prompt-Driven UI:** Headers and footers mimic shell environments (e.g., `$ user@linuxdle: ~ 2026`).
- **Zero Shadows:** Strictly flat UI with sharp borders (`border-radius: 0`) and high-contrast color palettes (Arch Blue/Cyan primary).
- **Custom Branding:** Favicon is a terminal-inspired `_ >` icon in `frontend/public/favicon.svg`.

### Game Modes
- **Daily Commands:** Guess the correct Linux command.
- **Daily Distros:** Identify a Linux distribution using "Logo Blur".
- **Daily Desktop Environments:** Recognize a DE/WM from a screenshot.

## Technical Stack
- **Backend:** .NET 10 (ASP.NET Core Minimal APIs)
- **Database:** PostgreSQL (v18)
- **Caching:** Redis (v8)
- **Frontend:** React 19 (TypeScript), Vite 7, Material UI (Monospace styled)
- **Orchestration:** Docker Compose

## Infrastructure & Workflows

### 1. Development Workflow
For local development without Cloudflare or Nginx overhead:
- **Command:** `docker-compose -f docker-compose.dev.yml up --build -d`
- **Frontend:** `http://localhost:5173` (Vite Hot-reload)
- **Backend:** `http://localhost:5000`
- **Database Tools:** pgAdmin available at `http://localhost:5050`

### 2. Production Stack
Production uses a secure gateway and tunnel architecture:
- **Command:** `docker-compose -f docker-compose.prod.yml up -d`
- **Gateway:** Nginx handles internal routing (`/api/` to `backend:8080`, `/` to `frontend:80`).
- **Tunnel:** `cloudflared` creates a secure outbound connection to Cloudflare.
- **Security:** No ports are exposed publicly; Cloudflare handles SSL and DDoS protection.

### 3. Maintenance Mode & Monitoring
A custom maintenance system is implemented via Cloudflare Workers:
- **Status URL:** `https://status.linuxdle.site`
- **Worker:** `linuxdle-maintenance-guard` serves a terminal-themed maintenance page.
- **Toggle Script:** `infrastructure/cloudflare/maintenance-mode.sh` allows switching maintenance mode `on`/`off`.
- **Auto-Monitor (PROD ONLY):** A `linuxdle-monitor` sidecar container polls the backend health. If the backend fails, it automatically runs the toggle script to activate maintenance mode (302 redirect to status page).

### 4. Database Management
- **Seeding:** Use `seed_db.py` to reset and populate the database with game data.
- **Connection:** Requires `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` env vars.
- **Logic:** Truncates game tables and re-inserts fresh data while fixing Postgres sequences.

## Development Conventions

### UI & Layout
- **Input Placement:** The guess input box must ALWAYS be placed **above** the list of user guesses.
- **Guess Ordering:** New guesses should be **prepended** to the guess list (most recent at the top).
- **Terminal Styling:** Maintain monospace fonts, sharp borders, and status-style messages (`[OK]`, `[FAIL]`).

### Game Mechanics (Hints)
- **Hint Reveal Logic:** Hints reveal progressively (e.g., every 2 wrong guesses).
- **Parameter Naming:** Consistently use `numberOfGuesses` for attempt counts in all layers.

## Architectural Notes
- **N-tier Architecture:** `Api` -> `Services` -> `Infrastructure` -> `Domain`.
- **State Management:** `localStorage` for daily persistence.
- **Gateway Routing:** ALWAYS use service names (e.g., `http://backend:8080`) in Nginx configs to support Docker's dynamic IP assignment.
