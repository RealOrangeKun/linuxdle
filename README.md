# 🐧 Linuxdle

> The daily guessing game for Linux enthusiasts! Test your knowledge of Linux Distributions, Desktop Environments, and Terminal Commands.

Linuxdle is a full-stack, open-source web application designed as a daily puzzle game (inspired by Wordle) tailored specifically for the Linux community. Every day, players are challenged to identify a specific Distro, a Desktop Environment from a screenshot, and a POSIX terminal command.

## ✨ Features

- **🎮 Three Game Modes:**
  - **Daily Distro:** Guess the Linux distribution based on attributes (Family, Package Manager, Release Year, etc.).
  - **Daily Desktop Environment:** Guess the DE based on visual screenshots and hints.
  - **Daily Command:** Guess the terminal command based on man page info and syntax.
- **⚡ High Performance:** Built on a robust .NET 10 backend with Redis hybrid caching.
- **📱 Responsive UI:** A clean, mobile-friendly interface built with React, Vite, and Material UI (MUI).
- **🛠️ Admin Console:** A dedicated Python-based admin interface for managing game data.
- **📊 Full Observability:** Pre-configured monitoring stack including Grafana, Prometheus, Loki, cAdvisor, and Node Exporter.
- **🛡️ Secure:** Designed for secure deployments via Cloudflare Tunnels with isolated Docker networks.

## 🏗️ Architecture & Tech Stack

Linuxdle is composed of several microservices orchestrated via Docker Compose:

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **UI Component Library:** Material UI (MUI) & Emotion
- **State/Routing:** React Router DOM

### Backend
- **Framework:** .NET 10 (C#) ASP.NET Core API
- **Database:** PostgreSQL 18 with Entity Framework Core
- **Caching:** Redis 8 (HybridCache)
- **Task Scheduling:** Quartz.NET (for daily puzzle rotation)

### Infrastructure & Tools
- **Gateway:** NGINX
- **Admin Console:** Python (FastAPI/Flask)
- **Monitoring:** Grafana, Prometheus, Loki, Promtail
- **CI/CD:** GitHub Actions for GHCR image building and deployment
- **Networking:** Cloudflare Tunnels (Zero Trust)

## 🚀 Getting Started (Local Development)

The easiest way to run Linuxdle locally is using Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Python 3.10+](https://www.python.org/) (for seeding the database)

### 1. Clone the repository
```bash
git clone https://github.com/RealOrangeKun/linuxdle.git
cd linuxdle
```

### 2. Set up Environment Variables
Copy the example environment file and configure any local overrides if necessary.
```bash
cp .env.example .env
```
*(Note: The `docker-compose.dev.yml` file has safe fallback defaults for local development, so you don't strictly need to fill out `.env` for local testing).*

### 3. Start the Development Stack
This will spin up the database, redis, backend, frontend, admin console, and the entire observability stack.
```bash
docker compose -f docker-compose.dev.yml up -d
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **Admin Console:** `http://localhost:5055`
- **Grafana:** `http://localhost:3000`
- **pgAdmin:** `http://localhost:5050`

### 4. Seed the Database
The initial database is empty. To populate it with the full catalog of Linux distros, commands, and DEs:
```bash
# Ensure your python environment has required packages (like psycopg2)
pip install -r seed_data/requirements.txt # if applicable
python seed_db.py
```
*(Alternatively, you can run `./seed_db.sh` to execute it directly against the Docker container).*

### 5. Running Tests
Linuxdle is thoroughly tested to prevent regressions. Before contributing, please ensure all sets of tests are passing.

- **Backend Unit & Integration Tests (.NET/xUnit):**
  Requires Docker to be running (uses Testcontainers to create isolated temporary database instances).
  ```bash
  # Run all backend tests
  dotnet test backend/tests/Linuxdle.UnitTests/Linuxdle.UnitTests.csproj
  dotnet test backend/tests/Linuxdle.IntegrationTests/Linuxdle.IntegrationTests.csproj
  ```

- **Frontend Component Tests (Vitest/RTL):**
  ```bash
  cd frontend
  npm ci
  npm run test
  ```

- **End-to-End System Tests (Playwright):**
  Playwright requires the Vite dev server to be running.
  ```bash
  cd e2e
  npm ci
  npx playwright install --with-deps chromium
  npx playwright test
  ```

## 📂 Project Structure

- `/frontend` - React SPA user interface.
- `/backend` - .NET 10 API source code, domain logic, and migrations.
- `/admin-console` - Administration web interface for data management.
- `/infrastructure` - Cloudflare Tunnel configurations and maintenance workers.
- `/monitoring` - Config files for Prometheus, Loki, and Grafana dashboards.
- `/seed_data` - Modular JSON files containing all game entities (Distros, Commands, DEs).

## 🤝 Contributing

We heartily welcome contributions from the community! However, please note that Linuxdle operates under a strict source-available model. Before opening any Pull Requests, please carefully read our [CONTRIBUTING.md](CONTRIBUTING.md) to understand the strict licensing restrictions and guidelines.

If it's your first time, here is the basic workflow:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/amazing-feature`) — make sure your commit messages follow the Conventional Commits specification!
3. Commit and push your changes.
4. Open a Pull Request against our `main` branch.

## 📝 License

This project is source-available under the **PolyForm Project License 1.0.0**. 

Please see the [LICENSE](LICENSE) file for exact terms. You are permitted to modify the software solely for the purpose of contributing back to this official repository. You are strictly prohibited from compiling, deploying, or distributing this codebase for any other purpose.