# Paper Maze — Playgama submission package

This package contains the original Paper Maze game with a minimal Playgama Bridge v2 integration.

## Included files

- `index.html` — game, original CSS/JavaScript/Canvas gameplay, Playgama Bridge SDK loader, save/load system, ads, and leaderboard UI (Leaderboard ID: `leaderboard1`).
- `playgama-bridge-config.json` — Bridge v2 configuration file including ad placements, SaaS public token, and leaderboard configuration (`leaderboard1`).

## Features Integrated

- **Playgama Bridge v2 SDK**: Initialized via official stable CDN (`https://bridge.playgama.com/v2/stable/playgama-bridge.js`). Handles `game_ready` signal, orientation, and host audio/pause synchronization.
- **Storage (Save & Load)**: Loads and saves player progress (`unlockedLevels`, `totalInkPoints`, `activeBrushId`, `purchasedBrushes`) via `bridge.storage`. Features a resilient `localStorage` fallback so progress persists even in standalone browser play or if platform storage is temporarily offline.
- **Advertisements**:
  - **Interstitial**: Requested at level completion (`level_completed`) and game over (`game_over`) using rate-limited, safe calls.
  - **Rewarded Ads**: Hooked into in-game mechanics:
    1. *Revive & Continue (+30s)*: Available on game over / wall hit to resume active play.
    2. *Bonus Ink (+50 pts)*: Available on level clear and in the Ink Brush Shop.
    Rewards are strictly granted only when the SDK emits the `rewarded` state event.
  - **Banner Ads**: Configured with placement `main_menu`. Automatically suppressed during gameplay to preserve controls and canvas visibility, and displayed safely only on idle screens when supported.
- **Leaderboards**:
  - Configured with Leaderboard ID `leaderboard1` (Name: *RankingLeaderboard*, Numeric, Higher is better).
  - Configured with Playgama SaaS public token `cmv6qrlxd0132j10hpaimh623` for platforms without native leaderboards.
  - Automatically submits player's Total Ink Score (`totalInkPoints`) at level completion and game over.
  - In-game Leaderboard screen ("Ranking" button on main menu) supporting `in_game`, `native`, and `native_popup` platform modes.
- **Player Profile & Avatar (`bridge.player`)**:
  - Menu header displays the player's profile avatar thumbnail and username.
  - Profile modal displays account status, total ink points, highest level reached, and platform authentication (`authorize()`) if supported.
- **Daily Login Reward (+10 Ink Points)**:
  - Grants exactly 10 ink points once per 24-hour period.
  - Claim date is persisted via Bridge storage and local storage.
- **Rate & Review Prompt (`bridge.social.rate()`)**:
  - Automatically prompts on milestone completion (Level 5) and includes a "Rate" button on the main menu.
- **Add to Favorites / Shortcut (`bridge.social`)**:
  - Supports `bridge.social.addToFavorites()` and `addToHomeScreen()` with fallback bookmarking guidance.
- **Basic Localization / Multi-Language (`bridge.platform.language`)**:
  - Auto-detects platform language with manual toggle for 5 languages: English (`en`), Russian (`ru`), Spanish (`es`), Turkish (`tr`), and German (`de`).

## Local testing

1. Extract or run in the project folder.
2. Start a local HTTP server in that folder (do not rely on opening `index.html` via `file://`):
   - Python: `python -m http.server 8000`
   - Node: `npx serve .`
   - Open `http://localhost:8000/` in Chrome or Edge.
3. In local browser mode, the SDK runs in mock platform mode:
   - Progress is persisted locally via `localStorage` fallback.
   - Leaderboard displays the configuration status and current ink points.
   - Ads fail safely without interrupting gameplay.

## Playgama configuration

- **App Public Token**: `cmv6qrlxd0132j10hpaimh623` (configured in `saas` block).
- **Leaderboard ID**: `leaderboard1` (configured in `leaderboards` and `index.html`).
- Open the official [Playgama Bridge Config Editor](https://playgama.github.io/bridge-config-editor/) if you wish to adjust minimum ad delays or add platform-specific overrides.

## Upload steps

1. Sign in to the [Playgama Developer Console](https://developer.playgama.com/).
2. Choose **Add Game** and upload `Paper_Maze_Playgama.zip`.
3. Complete the game metadata, supported device/orientation settings, and any platform-specific form fields requested by the console.
4. Run the Playgama QA Tool. Check mobile and desktop, orientation changes, pause/resume, audio mute/resume, saves, level progression, and interstitial behavior. Fix any QA findings before submitting for moderation.

## Known limitations / verification status

- This package was statically checked and browser-tested in a local Chromium session where feasible; it has not been uploaded to Playgama, and Playgama QA/moderation has not been run.
- External CDN dependencies remain in place to avoid changing the game's visual assets and styling. A network block or CDN outage can affect styling/icons/fonts.
- The source game contains English UI text only. Bridge language is read as required, but actual translations must be authored before claiming full multilingual localization.
- Playgama platform storage and real interstitial delivery cannot be verified outside the platform/QA environment.
- The game's free-drawing strokes are session-only in the original design; the existing progress/shop save system is what has been migrated to Bridge Storage.
