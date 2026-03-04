# Linuxdle 🐧

Welcome to the **Linuxdle** project. This is a Wordle-inspired daily puzzle suite designed for Linux enthusiasts and power users.

## Project Overview
Linuxdle provides a collection of daily guessing games focused on the Linux ecosystem.

### Game Modes
- **Daily Commands:** Guess the correct Linux command from a set of categories.
- **Daily Distros:** Identify a Linux distribution.
  - **Mechanic:** Uses "Distro Logo Blur" where the logo starts blurry and clears up progressively.
  - **Tuning:** Quality increases exponentially with each try (`qualityPercentage`).
  - **Visual Effects:** 
    - **Progressive Clarity:** Higher quality results in less pixelation and blur.
    - **Gaussian Blur:** Decreases as the player makes more guesses.
- **Daily Desktop Environments:** Recognize a DE from a screenshot.
- **Challenger Mode (Linus Torvalds Mode):** A high-difficulty mode where images are displayed in grayscale.
  - **Hard Mode Tuning:** Icons are flipped horizontally to increase difficulty.

## Technical Stack
- **Backend:** .NET 10 (ASP.NET Core Minimal APIs)
- **Database:** PostgreSQL (v18)
- **Caching & Rate Limiting:** Redis (v8)
- **ORM:** Entity Framework Core (Clean Architecture)
- **Background Tasks:** Quartz.NET (for daily puzzle rollovers and cleanup)
- **Validation:** FluentValidation
- **Orchestration:** Docker Compose

## Architectural Notes
- The project follows a **Layered Architecture (N-tier)** pattern.
- **Dependency Flow:** `Linuxdle.Api` -> `Linuxdle.Services` -> `Linuxdle.Infrastructure` -> `Linuxdle.Domain`.
- **Image Processing:** Custom image processors handle the blur, grayscale, and transformation effects for game mechanics.
