# Linuxdle — Copilot Instructions

Wordle-inspired daily puzzle suite for Linux enthusiasts. Three game modes: Daily Commands, Daily Distros, Daily Desktop Environments.

## Architecture

- **Backend** (.NET 10, C# 14): N-tier — `Api` → `Services` → `Infrastructure` → `Domain`
- **Frontend**: React 19 + TypeScript, Vite 7, MUI v7, React Router v7
- **Data**: PostgreSQL 18 (snake_case via `UseSnakeCaseNamingConvention()`), Redis 8 (`HybridCache` L1+L2)
- **Observability**: OpenTelemetry metrics/logging, Prometheus scrape endpoint (`/metrics`), health endpoint (`/health`)
- **Orchestration**: Docker Compose. Nginx gateway routes `/api/` → `backend:8080`, `/` → `frontend:80`
- **Prod**: Cloudflare Tunnel (no public ports), maintenance worker at `status.linuxdle.site`

## Development

```sh
docker compose -f docker-compose.dev.yml up --build -d
# Frontend: http://localhost:5173  Backend: http://localhost:5000  Admin: http://localhost:5055  pgAdmin: http://localhost:5050
python seed_db.py
```

Backend uses `mise` for tooling (`dotnet 10`). Central package management via `Directory.Packages.props`.

Backend test projects are in `backend/tests/`:
- `Linuxdle.UnitTests` (xUnit + Moq + EF InMemory)
- `Linuxdle.IntegrationTests` (xUnit + `WebApplicationFactory` + Testcontainers for PostgreSQL/Redis)

## Backend Patterns

### Endpoint convention (REPR / vertical slice)
Each endpoint lives in `Endpoints/{Feature}/{Action}/` with up to 3 files:
- `*Endpoint.cs` (or occasionally legacy file names) — endpoint class implementing `IEndpoint`, maps route + contains `HandleAsync`
- `*Request.cs` — request record for body/query binding (usually `internal sealed`; one DE submit request is currently `public sealed`)
- `*RequestValidator.cs` — `AbstractValidator<T>` (FluentValidation)

Route behavior patterns:
- Guess POST endpoints chain `.AddEndpointFilter<ValidationFilter<TRequest>>()` and `.RequireAuthorization()`.
- List + yesterday-target GET endpoints use `.CacheOutput(...)` with expiration computed to next UTC midnight.
- Image GET endpoints set explicit `Cache-Control: public, max-age=<seconds until UTC midnight>` and return PNG bytes.
- All endpoints are auto-discovered via reflection in `EndpointExtensions.cs` and mapped under `/api` (`app.MapGroup("/api").MapAllEndpoints()`).

Example GET (no request/validator):
```csharp
// Endpoints/DailyCommands/GetDailyCommands/GetDailyCommandsEndpoint.cs
internal sealed class GetDailyCommandsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-commands", HandleAsync)
            .CacheOutput(policy =>
            {
                var now = DateTime.UtcNow;
                var tomorrow = now.Date.AddDays(1);
                policy.Expire(tomorrow - now);
            })
            .WithTags(Tags.DailyCommands)
            .RequireAuthorization();
    }
    private async Task<IResult> HandleAsync(
        [FromServices] IDailyCommandService dailyCommandService,
        CancellationToken cancellationToken) { ... }
}
```

Example POST (request + validator + filter):
```csharp
// Endpoints/DailyCommands/SubmitGuess/SubmitDailyCommandGuessEndpoint.cs
internal sealed partial class SubmitDailyCommandGuessEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/daily-commands/guesses", HandleAsync)
            .AddEndpointFilter<ValidationFilter<SubmitDailyCommandGuessRequest>>()
            .WithTags(Tags.DailyCommands)
            .RequireAuthorization();
    }
}
// SubmitDailyCommandGuessRequest.cs
internal sealed record SubmitDailyCommandGuessRequest(string UserGuess);
// SubmitDailyCommandRequestValidator.cs
internal sealed class SubmitDailyCommandRequestValidator : AbstractValidator<SubmitDailyCommandGuessRequest> { ... }
```

### API routes
| Method | Route | Feature | Auth |
|--------|-------|---------|------|
| GET | `/api/daily-commands` | List all command names | Required |
| POST | `/api/daily-commands/guesses` | Submit command guess → `DailyCommandGuessResultDto` | Required |
| GET | `/api/daily-commands/yesterdays-target` | Fetch yesterday's command target | Required |
| POST | `/api/daily-commands/give-up` | Give up and reveal command target | Required |
| GET | `/api/daily-distros` | List distro name+slug | Required |
| GET | `/api/daily-distros/daily-distro.png?numberOfTries=&hardMode=` | Progressive logo image bytes | Public |
| POST | `/api/daily-distros/guesses` | Submit distro guess → `{isCorrect}` | Required |
| GET | `/api/daily-distros/yesterdays-target` | Fetch yesterday's distro target | Required |
| POST | `/api/daily-distros/give-up` | Give up and reveal distro target | Required |
| GET | `/api/daily-desktop-environments` | List DE name+slug | Required |
| GET | `/api/daily-desktop-environments/daily-desktop-environment.png` | DE screenshot bytes | Public |
| POST | `/api/daily-desktop-environments/guesses` | Submit DE guess → hints based on `numberOfGuesses` | Required |
| GET | `/api/daily-desktop-environments/yesterdays-target` | Fetch yesterday's DE target | Required |
| POST | `/api/daily-desktop-environments/give-up` | Give up and reveal DE target | Required |
| GET | `/api/settings/game-settings` | Client game settings (`minGuessesToGiveUp`) | Public |
| POST | `/api/users` | Register anonymous user → JWT + refresh cookie | Public |
| POST | `/api/users/refresh-token` | Refresh JWT via httpOnly cookie | Public |
| GET | `/api/users/stats` | Current streak + last completed date | Required |

### Domain entities
Private constructors + `static Create(...)` factory methods + private setters. Located in `Linuxdle.Domain/{Feature}/`. EF Core configures each entity via `IEntityTypeConfiguration<T>` in `Infrastructure/Data/Configurations/`.

Key entities: `DailyCommand` (has M:N with `DailyCommandCategory`), `DailyDistro`, `DailyDesktopEnvironment` (has 1:N `DesktopEnvironmentScreenshot`), `DailyPuzzle` (composite unique on `GameId`+`ScheduledDate`), `Game`, `User` (refresh token lifecycle + streak state), `UserGuess`, `UserGiveUp`.

Game IDs are constants in `GameIds`: `DailyCommands = 1`, `DailyDistros = 2`, `DailyDesktopEnvironments = 3`.

### Services
`internal sealed` classes with primary constructors. Inject `LinuxdleDbContext` directly (no repository layer) + `HybridCache`. Interface is `public`; implementation is `internal`. All registered as scoped in `Services/Extensions/DependencyInjection.cs`.

Current game-service behavior highlights:
- Validates "already gave up" before accepting guesses.
- Supports give-up endpoints with minimum guesses enforced via `GameSettings.MinGuessesToGiveUp`.
- Updates streak via `IUserStreakService` after guess/give-up actions.

Cache keys follow naming convention in `Services/Common/Constants/CacheKeys.cs`:
- `daily_distro_target_{date}`, `daily_command_target_{date}`, `daily_de_target_{date}` for daily targets
- `daily_distro_image_{date}_tries_{tries}_hardmode_{hardMode}` for processed distro images
- `daily_de_screenshot_{screenshotId}` for DE screenshot bytes
- `all_command_names`, `all_distros`, `all_desktop_environments` for list caches
- `all_game_ids`
- Entity-specific: `command_{name}`, `distro_{slug}`, `de_{slug}`

### DI registration
C# 14 extension types (`extension(IServiceCollection)`) in each layer's `Extensions/DependencyInjection.cs`:
- `AddInternalServices()` — services layer (scoped service registrations)
- `AddInfrastructure(config)` — EF Core + Redis + HybridCache
- `AddOptionsConfiguration(config)` — all `IOptions<T>` bindings + Quartz job configs
- `AddQuartzConfiguration(config)` — Quartz with PostgreSQL persistent store + clustering
- `AddRateLimiting(config)` — global fixed-window + per-endpoint sliding-window rate limiters
- `AddOpenTelemetry(config)` — metrics + OTLP log exporter configuration

### Background jobs
Quartz.NET with `[DisallowConcurrentExecution]`. Thin `IJob` classes in `BackgroundJobs/` delegate to services. Each job has a dedicated `IConfigureOptions<QuartzOptions>` in `Configurations/`. `LoggingJobListener` logs START/SUCCESS/FAIL for all jobs.

Jobs: `DailyPuzzlesJob` (schedules puzzles 30 days ahead), `CleanUsersJob` (deletes expired users), `PrewarmDailyDistroJob` (pre-caches all distro image blur levels), `PrewarmDailyDesktopEnvironmentJob` (pre-caches DE screenshot).

### Error handling
`LinuxdleException` (abstract base) → `NotFoundException` (404), `BadRequestException` (400). `GlobalExceptionHandler` maps these via pattern matching to RFC 7807 `ProblemDetails`. Development mode exposes full stack trace for 500s.

### Middleware / access policy
- `CountryRestrictionMiddleware` blocks requests with `CF-IPCountry: IL` and returns HTTP `451` with `ProblemDetails`.
- Frontend probes `/health` and reacts to 451 by switching to country-blocked UI.

### DTOs
All DTOs are `public sealed record` types in `Services/Dtos/Records/`. Enums (`MatchResult`: Red/Yellow/Green, `YearDirection`: None/Higher/Lower) in `Services/Dtos/Enums/`.

Notable DTOs include:
- `DailyCommandGuessResultDto`, `DailyDistroGuessResultDto`, `DailyDesktopEnvironmentGuessResultDto`
- `UserStreakDto` (`CurrentStreak`, `LastCompletedDate`)

## Frontend Patterns

### Auth
Anonymous auth flow is refresh-first:
- `useAuth` first tries `POST /api/users/refresh-token` to restore a prior session.
- If refresh is unauthorized (401/403), it registers via `POST /api/users`.
- Access JWT is stored in localStorage (`linuxdle_token`); refresh token stays httpOnly cookie.
- Axios response interceptor retries 401 requests after refresh and handles 451 country-block responses.
- Multi-tab refresh lock is implemented in `apiClient.ts` (`linuxdle_refresh_lock`) to avoid refresh stampedes.

### Routing
React Router v7 in `App.tsx`: `<Layout />` parent route with children including:
- Game routes: `/`, `/commands`, `/distros`, `/des`
- Info/legal routes: `/about`, `/privacy`, `/terms`, `/contact`, `/man`
- Content routes: `/guides` and `/guides/*`, `/releases`

If geo-blocked, app renders `CountryNotSupported` instead of game routes.

### SEO / prerender
- Build script runs `node scripts/prerender-routes.mjs` after Vite build.
- It generates per-route `dist/<route>/index.html` metadata (title/description/canonical/OG/Twitter tags) for key routes.

### Theme
MUI `createTheme` with full terminal aesthetic defined in `App.tsx`:
- Light mode: `primary: #1793D1` (Arch Blue), dark: `#0D1117` bg with `#8BE9FD` primary
- Fonts: `"Fira Code", "JetBrains Mono", "Source Code Pro", monospace`
- `borderRadius: 0` globally, `boxShadow: 'none'` on Paper/Button/AppBar
- `ColorModeContext` provides toggle, persisted in `linuxdle_theme_mode`

### Page structure (all 3 game pages follow this pattern)
1. **Fetch options on mount** — GET available items (commands/distros/DEs)
2. **Fetch yesterday target** — uses `/yesterdays-target` endpoint with local cache helper (`yesterdayCache`)
3. **Hydrate from localStorage** — if saved state's `date` matches `today` (ISO `YYYY-MM-DD`)
4. **Load game settings** — `useGameSettings()` calls `/settings/game-settings` (controls give-up threshold)
5. **Sync state to localStorage** — via `useEffect` on results/game-over/give-up state
6. **Submit guess** — POST to guess endpoint, prepend result to array
7. **Give-up flow** — after minimum guess count, users can call `/give-up` endpoint (`SIGKILL` UI action)
8. **Game-over redirect** — if all 3 games complete (`checkAllGamesCompleted()`), auto-navigate to `/` after 2s
9. **Midnight reset safety** — `useMidnightReload()` reloads page at next UTC midnight
10. **No global game store** — each page owns its own `useState` + localStorage persistence

Storage keys: `linuxdle_commands_state`, `linuxdle_distros_state`, `linuxdle_des_state`.

Additional keys used across app:
- `linuxdle_game_settings`
- `yesterday-commands`, `yesterday-distros`, `yesterday-des`
- `linuxdle_current_streak`, `linuxdle_redirected_today`
- `linuxdle_country_blocked`, `linuxdle_refresh_lock`

### Game-specific mechanics
- **Commands**: MUI `Autocomplete` + result table with color-coded match cells (Green/Yellow/Red) and year direction hint.
- **Distros**: Progressive logo reveal with server-side processing (`GaussianBlur` + pixelation). `hardMode` applies grayscale + horizontal flip. Logo URL uses `numberOfTries` and `hardMode` query params.
- **Desktop Environments**: Screenshot-based guessing with progressive hints (2→family, 4→configurationLanguage, 6→releaseYear, 8→primaryLanguage). Includes fullscreen zoom with wheel/pinch + drag.
- **All 3 games**: support give-up (`SIGKILL`) after configurable minimum guesses.

### UI rules
- Guess input always **above** the results list
- New guesses **prepended** (most recent at top)
- Terminal aesthetic: monospace fonts, shell-style symbols (`[OK]`, `[FAIL]`, `$ user@linuxdle`), zero border-radius
- Button labels: `EXEC` for submit, `CD ../DAILY_DISTROS` for navigation between games
- Headers: `_ > DAILY_COMMAND`, status: `[OK] COMMAND_IDENTIFIED`, `[STATUS_OK]`
- No emojis — only text glyphs and box-style labels

### Components
- `Layout.tsx` — AppBar/nav, dark mode toggle, footer, streak display (`/users/stats`), support dialog wiring
- `CountdownTimer.tsx` — countdown to next UTC midnight, shown on Home when all games complete
- `SupportDialog.tsx` — shown for all-complete/give-up outcomes
- `useGameSettings.ts` — loads `minGuessesToGiveUp`
- `useMidnightReload.ts` — schedules UTC midnight page reload

## Data Model

### Seeding (`seed_db.py`)
Python script uses modular seeders from `seed_data/` and sequence fixing. Current approach is idempotent inserts (not full TRUNCATE reseed) and targeted Redis invalidation.

Cache invalidation in seeding aligns with backend cache keys and clears:
- list caches (`all_*` keys)
- daily target/image/screenshot pattern keys (`daily_*`)
- entity lookup pattern keys (`command_*`, `distro_*`, `de_*`)

Env vars include DB and Redis settings (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`) with local defaults.

Games table: `Commands (1)`, `Distros (2)`, `DE (3)`. Daily puzzles link a `GameId` + `TargetId` + `ScheduledDate` (composite unique).

### Static assets
- Distro logos: `wwwroot/assets/distros/{slug}.png`
- DE screenshots: `wwwroot/assets/des/{slug}/{slug}1.png`

## Key Conventions

| Area | Convention |
|------|-----------|
| Visibility | `internal sealed` for implementations; `public` for interfaces and domain entities |
| Constructors | Primary constructors for DI; private ctor + factory for domain entities |
| Request DTOs | Usually `internal sealed record` in endpoint folder (allow existing exceptions) |
| Response DTOs | `public sealed record` in `Services/Dtos/Records/` |
| Caching | `HybridCache.GetOrCreateAsync()` with structured cache keys from `CacheKeys.cs` |
| DB naming | PostgreSQL snake_case (automatic via `EFCore.NamingConventions`) |
| API prefix | All endpoints under `/api` |
| Tags | Static `Tags` class for OpenAPI grouping |
| Hint param | `numberOfGuesses` used for DE hint progression |
| Give-up threshold | Driven by `GameSettings.MinGuessesToGiveUp` across all game services |
| C# version | C# 14 — uses `extension(T)` syntax for DI registration |
| Config | Options pattern: POCO classes bound via `IOptions<T>`, sections named after class |
| Queries | `.AsNoTracking()` + `.Select()` projection into DTOs for all reads |
| Validators | Auto-registered from assembly: `AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true)` |
