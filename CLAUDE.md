# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (HMR)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint on all .js/.jsx files
```

No test suite exists in this project.

## Architecture

This is a single-page browser RPG called "Realm of Shadows". The entire game is implemented in **one large file: `src/App.jsx`** (~2300+ lines). There are no sub-components split into separate files — everything lives in App.jsx.

### Game Structure

The `App` default export holds all game state via `useState` hooks and renders the appropriate screen based on a `screen` state variable. Screens:
- `"title"` — class selection
- `"naming"` — character naming
- `"explore"` — hub between fights (shop, equipment, explore button)
- `"gameover"` / `"victory"` — end states
- `"hall"` — Hall of Champions leaderboard
- `"duelVictory"` / `"challengeIntro"` — PvP challenge flow

### Key Data Constants (all in App.jsx)

- `CLASSES` — 7 playable classes, each with `stats` and 3 `abilities`
- `ZONES` (8 zones) + `ENEMIES_BY_ZONE` — zone backgrounds and enemy pools per zone
- `EQUIPMENT`, `CONSUMABLES`, `MONSTER_RELICS`, `TRINKETS` — all item definitions
- `LOOT_TABLES` / `MONSTER_LOOT` — per-zone loot pools
- `UPGRADES` — stat upgrade options on level-up
- `SHEETS` / `SHEET_META` — sprite sheet registry for portrait rendering

### Combat & State Effects

Combat state is managed via a `se` object (status effects) containing fields like `burn`, `stunned`, `dodgeReady`, `infernoAegis`, `hellbreakerUsed`, etc. Buffs/debuffs with turn counters live in a `buffs` object `{ player: [], enemy: [] }`.

Equipment bonuses are computed at render time via `effStats(player, equipped)` — base player stats are never mutated by equipment; bonuses are applied on the fly.

### Portraits

`Portrait` renders sprite-sheet crops using CSS background-position math. `ClassPortrait` and `EnemyPortrait` map class/enemy IDs to sheet coordinates. `ItemPortrait` maps item IDs to the equipment sprite sheet. Per-sprite `yOffset`/`xOffset`/`zoom` values are tuned visually — change these carefully.

### Firebase / Leaderboard

Firebase Firestore is used for the Hall of Champions leaderboard. Config is hardcoded in App.jsx (lines 5–12). The `HallScreen` component reads from the `champions` collection; `VictoryScreen` writes to it.

### Audio

SFX uses the Web Audio API procedurally (no external files). Background music expects MP3 files at `public/assets/sounds/zone1.mp3` through `zone8.mp3` and `victory.mp3` (not included in repo). The `useMusicPlayer` hook handles zone-based crossfading.

### Deployment

Vite base is `/realm-of-shadows/` — all asset paths in SHEETS and audio use this prefix. This matches a GitHub Pages deployment at `<user>.github.io/realm-of-shadows/`.

### ESLint

`no-unused-vars` ignores names matching `/^[A-Z_]/` (constants). No TypeScript.
