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

### Game Modes
- **Daily Commands:** Guess the correct Linux command.
  - **Logic:** Categories show names separated by commas.
  - **Color Coding:** Green (perfect match), Orange (intersection), Red (no match).
- **Daily Distros:** Identify a Linux distribution.
  - **Mechanic:** Uses "Distro Logo Blur" where the logo clears up progressively with each try.
  - **Quality Tuning:** Supports up to 12 levels of clarity.
- **Daily Desktop Environments:** Recognize a DE from a screenshot.
  - **Features:** Supports zoom and pan for high-resolution screenshots from r/unixporn.
- **Unlimited Guesses:** Users can guess as many times as they want; suggestions are filtered as they are used.
- **Persistence:** Game state (guesses, win/loss) is persisted in `localStorage` per day.

## Technical Stack
- **Backend:** .NET 10 (ASP.NET Core Minimal APIs)
- **Database:** PostgreSQL (v18)
- **Caching & Rate Limiting:** Redis (v8)
- **ORM:** Entity Framework Core (Clean Architecture)
- **Background Tasks:** Quartz.NET (with Clustering and Postgres persistence)
- **Frontend:** React 19 (TypeScript), Vite 7, Material UI (Monospace styled)
- **Orchestration:** Docker Compose (Multi-stage builds, Hot-reloading in Dev)

## Infrastructure & Deployment
- **Frontend Dockerfile:** Multi-stage build supporting `dev` (hot-reload) and `production` (Nginx SPA serving).
- **Gateway:** A dedicated Nginx container (`/gateway`) acts as the single entry point for production, handling routing to frontend/backend and security headers.
- **Tunnel:** Secure Cloudflare Tunnel (`cloudflared`) used for self-hosting without port forwarding.
- **Docker Compose:** 
  - `docker-compose.prod.yml`: Production stack using the Gateway and Tunnel.
  - Development override with Redis non-persistence (`--save "" --appendonly no`) for clean restarts.

## Server Setup & Deployment

### 1. Prerequisites
- Docker and Docker Compose installed.
- A domain name managed via Cloudflare.
- A Cloudflare Tunnel created in the Zero Trust Dashboard.

### 2. Environment Configuration
Create a `.env` file in the project root on the server (this file is git-ignored):
```env
# Cloudflare Tunnel Token (from dashboard)
CF_TUNNEL_TOKEN=your_token_here

# Database Password
DB_PASSWORD=your_secure_password
```

### 3. Execution
Launch the production stack:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Cloudflare Routing
In the Cloudflare Tunnel dashboard, point your Public Hostname to the internal Docker gateway:
- **Service Type:** `HTTP`
- **URL:** `gateway:80`

## Development Conventions

### UI & Layout
- **Input Placement:** The guess input box (Autocomplete/TextField) must ALWAYS be placed **above** the list of user guesses.
- **Guess Ordering:** New guesses should be **prepended** to the guess list so that the most recent attempt is always at the top.
- **Terminal Styling:** Maintain the "Terminal Aesthetic" using monospace fonts, sharp borders, and shell-inspired status messages (e.g., `[OK]`, `STATUS_OK`).

### Game Mechanics (Hints)
- **Hint Reveal Logic:** Hints should generally be revealed progressively. For the Daily DE game, a hint is revealed every **2 wrong guesses** (thresholds: 2, 4, 6, 8).
- **Hint Display:** Revealed hints should be displayed in a prominent, themed container (e.g., the "DECRYPTED_DATA" box) above the input or between the input and guesses.
- **Parameter Naming:** Use `numberOfGuesses` (backend) and `numberOfGuesses` (frontend) when passing attempt counts to services/APIs.

## Architectural Notes
- The project follows a **Layered Architecture (N-tier)** pattern.
- **Dependency Flow:** `Linuxdle.Api` -> `Linuxdle.Services` -> `Linuxdle.Infrastructure` -> `Linuxdle.Domain`.
- **State Management:** Simple `localStorage` sync for daily progress tracking.
