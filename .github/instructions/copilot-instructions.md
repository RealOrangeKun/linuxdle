# Linuxdle — Copilot Instructions

Wordle-inspired daily puzzle suite for Linux enthusiasts. Three game modes: Daily Commands, Daily Distros, Daily Desktop Environments.

## Architecture

- **Backend** (.NET 10, C# 14): N-tier — `Api` → `Services` → `Infrastructure` → `Domain`
- **Frontend**: React 19 + TypeScript, Vite 7, MUI v7, React Router v7
- **Data**: PostgreSQL 18 (snake_case via `UseSnakeCaseNamingConvention()`), Redis 8 (`HybridCache` L1+L2)
- **Orchestration**: Docker Compose. Nginx gateway routes `/api/` → `backend:8080`, `/` → `frontend:80`
- **Prod**: Cloudflare Tunnel (no public ports), maintenance worker at `status.linuxdle.site`

## Development

```sh
docker-compose -f docker-compose.dev.yml up --build -d
# Frontend: http://localhost:5173  Backend: http://localhost:5000  pgAdmin: http://localhost:5050
python seed_db.py  # Truncates + re-seeds all game data (defaults: localhost/linuxdle/linuxdle)
```

Backend uses `mise` for tooling (`dotnet 10`). Central package management via `Directory.Packages.props`. No test project exists yet.

## Backend Patterns

### Endpoint convention (REPR / vertical slice)
Each endpoint lives in `Endpoints/{Feature}/{Action}/` with up to 3 files:
- `*Endpoint.cs` — `internal sealed class` implementing `IEndpoint`, maps route + contains `HandleAsync`
- `*Request.cs` — `internal sealed record` for the request body (POST/PUT endpoints only)
- `*RequestValidator.cs` — `internal sealed class` extending `AbstractValidator<T>` (FluentValidation)

POST endpoints chain `.AddEndpointFilter<ValidationFilter<TRequest>>()`. GET endpoints that serve lists use `.CacheOutput(policy => policy.Expire(TimeSpan.FromHours(24)))`. All endpoints are auto-discovered via reflection in `EndpointExtensions.cs` and mapped under `/api` (`app.MapGroup("/api").MapAllEndpoints()`).

Example GET (no request/validator):
```csharp
// Endpoints/DailyCommands/GetDailyCommands/GetDailyCommandsEndpoint.cs
internal sealed class GetDailyCommandsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/daily-commands", HandleAsync)
            .CacheOutput(policy => policy.Expire(TimeSpan.FromHours(24)))
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
| Method | Route | Feature |
|--------|-------|---------|
| GET | `/api/daily-commands` | List all command names |
| POST | `/api/daily-commands/guesses` | Submit command guess → `DailyCommandGuessResultDto` |
| GET | `/api/daily-distros` | List distro name+slug |
| GET | `/api/daily-distros/daily-distro.png?numberOfTries=&hardMode=` | Progressive logo blur image |
| POST | `/api/daily-distros/guesses` | Submit distro guess → `{isCorrect}` |
| GET | `/api/daily-desktop-environments` | List DE name+slug |
| GET | `/api/daily-desktop-environments/daily-desktop-environment.png` | DE screenshot |
| POST | `/api/daily-desktop-environments/guesses` | Submit DE guess → hints based on `numberOfGuesses` |
| POST | `/api/users` | Register anonymous user → JWT (rate-limited) |
| POST | `/api/users/refresh-token` | Refresh JWT via httpOnly cookie |

### Domain entities
Private constructors + `static Create(...)` factory methods + private setters. Located in `Linuxdle.Domain/{Feature}/`. EF Core configures each entity via `IEntityTypeConfiguration<T>` in `Infrastructure/Data/Configurations/`.

Key entities: `DailyCommand` (has M:N with `DailyCommandCategory`), `DailyDistro`, `DailyDesktopEnvironment` (has 1:N `DesktopEnvironmentScreenshot`), `DailyPuzzle` (composite unique on `GameId`+`ScheduledDate`), `Game`, `User` (check constraint: `expires_at > last_refresh_at`), `UserGuess`.

Game IDs are constants in `GameIds`: `DailyCommands = 1`, `DailyDistros = 2`, `DailyDesktopEnvironments = 3`.

### Services
`internal sealed` classes with primary constructors. Inject `LinuxdleDbContext` directly (no repository layer) + `HybridCache`. Interface is `public`; implementation is `internal`. All registered as scoped in `Services/Extensions/DependencyInjection.cs`.

Cache keys follow naming convention in `Services/Common/Constants/CacheKeys.cs`:
- `daily_distro_target_{date}`, `daily_command_target_{date}`, `daily_de_target_{date}` for daily targets
- `all_command_names`, `all_distros`, `all_desktop_environments` for list caches
- Entity-specific: `command_{name}`, `distro_{slug}`, `de_{slug}`

### DI registration
C# 14 extension types (`extension(IServiceCollection)`) in each layer's `Extensions/DependencyInjection.cs`:
- `AddInternalServices()` — services layer (scoped service registrations)
- `AddInfrastructure(config)` — EF Core + Redis + HybridCache
- `AddOptionsConfiguration(config)` — all `IOptions<T>` bindings + Quartz job configs
- `AddQuartzConfiguration(config)` — Quartz with PostgreSQL persistent store + clustering
- `AddRateLimiting(config)` — global fixed-window + per-endpoint sliding-window rate limiters

### Background jobs
Quartz.NET with `[DisallowConcurrentExecution]`. Thin `IJob` classes in `BackgroundJobs/` delegate to services. Each job has a dedicated `IConfigureOptions<QuartzOptions>` in `Configurations/`. `LoggingJobListener` logs START/SUCCESS/FAIL for all jobs.

Jobs: `DailyPuzzlesJob` (schedules puzzles 30 days ahead), `CleanUsersJob` (deletes expired users), `PrewarmDailyDistroJob` (pre-caches all distro image blur levels), `PrewarmDailyDesktopEnvironmentJob` (pre-caches DE screenshot).

### Error handling
`LinuxdleException` (abstract base) → `NotFoundException` (404), `BadRequestException` (400). `GlobalExceptionHandler` maps these via pattern matching to RFC 7807 `ProblemDetails`. Development mode exposes full stack trace for 500s.

### DTOs
All DTOs are `public sealed record` types in `Services/Dtos/Records/`. Enums (`MatchResult`: Red/Yellow/Green, `YearDirection`: None/Higher/Lower) in `Services/Dtos/Enums/`.

## Frontend Patterns

### Auth
Anonymous auto-registration: `useAuth` hook POSTs to `/api/users` on first visit, stores JWT in localStorage (`linuxdle_token`). Axios interceptor in `apiClient.ts` handles 401 → `POST /api/users/refresh-token` (via httpOnly cookie) → retry original request. Refresh token is set as httpOnly cookie by backend.

### Routing
React Router v7 in `App.tsx`: `<Layout />` parent route with children: `/` (Home), `/commands`, `/distros`, `/des`.

### Theme
MUI `createTheme` with full terminal aesthetic defined in `App.tsx`:
- Light mode: `primary: #1793D1` (Arch Blue), dark: `#0D1117` bg with `#8BE9FD` primary
- Fonts: `"Fira Code", "JetBrains Mono", "Source Code Pro", monospace`
- `borderRadius: 0` globally, `boxShadow: 'none'` on Paper/Button/AppBar
- `ColorModeContext` provides toggle, persisted in `linuxdle_theme_mode`

### Page structure (all 3 game pages follow this pattern)
1. **Fetch options on mount** — GET available items (commands/distros/DEs)
2. **Hydrate from localStorage** — if saved state's `date` matches `today` (ISO `YYYY-MM-DD`)
3. **Sync state to localStorage** — via second `useEffect` on every results change
4. **Submit guess** — POST to guess endpoint, prepend result to array
5. **Game-over redirect** — if all 3 games complete (`checkAllGamesCompleted()`), auto-navigate to `/` after 2s
6. **No global state** — each page manages its own `useState` + localStorage

Storage keys: `linuxdle_commands_state`, `linuxdle_distros_state`, `linuxdle_des_state`.

### Game-specific mechanics
- **Commands**: MUI `Autocomplete` + `Table` showing color-coded cells (Green/Yellow/Red) for name, package, year, section, built-in, POSIX, categories. Year shows directional arrow (Higher/Lower).
- **Distros**: Progressive image reveal — backend generates blur levels with `SixLabors.ImageSharp`. `hardMode` toggle ("LINUS_TORVALDS_MODE") renders grayscale+flipped. Logo URL has `numberOfTries` query param.
- **Desktop Environments**: Screenshot-based guessing with hints revealed progressively at guess thresholds (2→family, 4→configLanguage, 6→releaseYear, 8→primaryLanguage). Includes fullscreen zoom with scroll-to-zoom and drag-to-pan.

### UI rules
- Guess input always **above** the results list
- New guesses **prepended** (most recent at top)
- Terminal aesthetic: monospace fonts, shell-style symbols (`[OK]`, `[FAIL]`, `$ user@linuxdle`), zero border-radius
- Button labels: `EXEC` for submit, `CD ../DAILY_DISTROS` for navigation between games
- Headers: `_ > DAILY_COMMAND`, status: `[OK] COMMAND_IDENTIFIED`, `[STATUS_OK]`
- No emojis — only text glyphs and box-style labels

### Components
- `Layout.tsx` — AppBar with nav buttons (`./commands`, `./distros`, `./des`), dark mode toggle, footer (`$ user@linuxdle: ~ {year}`)
- `CountdownTimer.tsx` — countdown to next UTC midnight, shown on Home when all games complete

## Data Model

### Seeding (`seed_db.py`)
Python script using `psycopg2`. TRUNCATEs 8 tables with CASCADE, inserts game data, fixes PostgreSQL sequences. Env vars: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (all default to `localhost`/`linuxdle`).

Games table: `Commands (1)`, `Distros (2)`, `DE (3)`. Daily puzzles link a `GameId` + `TargetId` + `ScheduledDate` (composite unique).

### Static assets
- Distro logos: `wwwroot/assets/distros/{slug}.png`
- DE screenshots: `wwwroot/assets/des/{slug}/{slug}1.png`

## Key Conventions

| Area | Convention |
|------|-----------|
| Visibility | `internal sealed` for implementations; `public` for interfaces and domain entities |
| Constructors | Primary constructors for DI; private ctor + factory for domain entities |
| Request DTOs | `internal sealed record` in endpoint folder |
| Response DTOs | `public sealed record` in `Services/Dtos/Records/` |
| Caching | `HybridCache.GetOrCreateAsync()` with structured cache keys from `CacheKeys.cs` |
| DB naming | PostgreSQL snake_case (automatic via `EFCore.NamingConventions`) |
| API prefix | All endpoints under `/api` |
| Tags | Static `Tags` class for OpenAPI grouping |
| Hint param | Always `numberOfGuesses` for attempt counts across all layers |
| C# version | C# 14 — uses `extension(T)` syntax for DI registration |
| Config | Options pattern: POCO classes bound via `IOptions<T>`, sections named after class |
| Queries | `.AsNoTracking()` + `.Select()` projection into DTOs for all reads |
| Validators | Auto-registered from assembly: `AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true)` |
