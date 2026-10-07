# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Drummer Cat is a first-person tap clicker (a cat knocks objects off a table) that runs as a static site and as a Telegram Mini App. Vanilla TypeScript + Vite, no UI framework, no backend, all graphics are inline SVG, animations use the Web Animations API (WAAPI).

Code comments, UI strings, README.md and SPEC.md are in Russian; keep new comments and user-facing text in Russian. Commit messages are in English.

SPEC.md is the authoritative design document. Section 18 records deliberate deviations from the original spec (object anchor point, paw pivot, parametric portrait, multi-file sprites, CSS-variable damage layers, overlapping KNOCK/STEP). Check it before "fixing" something that looks inconsistent with earlier spec sections. `main.py` is an unused PyCharm placeholder reserved for a future bot/leaderboard.

## Commands

Node 20+. No linter or formatter is configured; `tsc` strictness (`noUnusedLocals`, `noUnusedParameters`) is the only static check.

```bash
npm run dev                                   # Vite dev server, http://localhost:5173 (host: true for LAN/phone testing)
npm test                                      # vitest run, all tests
npx vitest run tests/tps.test.ts              # one file
npx vitest run tests/tps.test.ts -t "один тап" # one test by name
npm run typecheck                             # tsc --noEmit
npm run build                                 # tsc --noEmit && vite build → dist/
npm run preview                               # serve dist/
```

Tests cover pure logic (`src/core`, `src/content/strikes.ts`) and content wiring (`tests/content.test.ts`: every sprite file imported in `main.ts`, every referenced symbol exists with the right viewBox, `--dmgN` layers match hp, ids pass the save whitelist, portraits render at all levels); environment is `node`, no DOM. Visuals are checked manually (SPEC.md §17); SPEC.md §19.3 describes slowing WAAPI via CDP `Animation.setPlaybackRate` to screenshot strikes that otherwise last tens of ms.

Deploy is automatic: `.github/workflows/deploy.yml` runs tests + build on every push to `main` and publishes `dist/` to GitHub Pages. `base: './'` in `vite.config.ts` keeps all asset paths relative. `__APP_VERSION__` is injected from `package.json` via Vite `define`.

## Architecture

### Core rule
Logic is instant, animations are cosmetic and interruptible. Every tap is exactly one hit and is never dropped. On each tap `main.ts` calls `anims.finishAll()` to snap all in-flight animations to their end state before starting new ones.

### Data flow
```
pointerdown/keydown → TpsMeter.tap() → Engine.hit() → EngineEvent[] → render classes
                                                       store.set()  → scheduleSave() (debounced)
```
- `src/core/` has no DOM access and is what the tests exercise.
- `src/main.ts` is the single composition root: it injects SVG sprites, loads the save, constructs every class, owns `onTap`, `applyCat`, `applySet`, and the fury-level sync.
- Render classes never mutate game state; they only react to events and to `level`/`power`.

### Tempo → fury → speed and power
`TpsMeter` (`core/tps.ts`) counts taps in a 1.5 s window and maps TPS to level 0–5 (`LEVELS`). Level rises instantly, drops only after 500 ms below threshold, and falls to 0 ("Сон") after 2 s idle. Two derived values drive everything visual:
- `speedMul` (1 → 0.4): multiplies every animation duration.
- `powerOf(level)` (0 → 1, in `content/strikes.ts`): drives paw pose, knock trajectory, shake, FX intensity.

### Engine (`core/engine.ts`)
Holds `current` and `next` objects (next is shown as a far silhouette). `hit()` returns `wobble` (hp left) or `knock` + `step` (object gone, next becomes current). `seq` counts objects per session: every 10th (`HEAVY_EVERY`) is hp ≥ 2, every 30th (`BOSS_EVERY`) is hp ≥ 5. Picks avoid repeating the last two objects; weighted by `weight`. Takes an injectable `rng` for deterministic tests. `setObjectSet` swaps objects without a step or counter change.

### Content layer (`src/content/`)
- `types.ts` has the `CatId` / `SetId` string unions. **When adding a cat or set, also update the hard-coded `cats` / `sets` whitelists in `normalizeSave` (`core/store.ts`)**, otherwise saved selections fall back to defaults.
- `cats.ts`: palette, `pawSymbol`, `strike`, optional `accessory`. `sets/<id>.ts`: 10 objects each. `sets/index.ts` and `cats.ts` export the lists the skins UI renders.
- `svg/*.svg` sprite files are imported with `?raw` and concatenated into `#sprites` in `main.ts` at boot. A new sprite file must be added to that import list or its symbols won't resolve. Symbol naming: `#obj-<id>` (viewBox 200×200, object stands on y=180), `#paw-<id>` (240×320), `#bg-<id>` (360×640).
- Damage layers inside object symbols are groups with `style="display:var(--dmgN,none)"` (N = 1..hp−1). `ObjectView.applyDamage` sets `--dmg1..--dmg4` on the `<use>`; CSS variables inherit into the `<use>` shadow tree, classes do not.

### Strike styles (`content/strikes.ts`)
Each cat has a unique `StrikeStyle` with `raised(power, lift)`, `swing(power, from)`, `back(power, to)`, `knock(power)`, plus `impact` point, `speedAngle`, `clawAngle`, `shakeMul`, and optional `preImpact` (`bolt` | `ring`), `burstColor`, `minBurst`, `wandTip`, `impactFx` (`ash` | `splash`, particles from a held prop at `propTip`). `tests/strikes.test.ts` enforces the contract for every style and all powers: `swing[0].transform === from`, `back[last].transform === to`, `back[0] === swing[last]`, `knock(1)` travels at least as far and rotates more than `knock(0)`, `dx < 0`, `dy > 0`, `raised(1) !== raised(0)`, and every cat's `strike` is distinct.

### Render (`src/render/`)
- `scene.ts` builds the one `<svg viewBox="0 0 360 640">` with layers `camera > world > (bg, objects)`, `fx`, `vignette`, `paw`, and exports scene constants (`OBJ_BASE`, `PAW_PIVOT`, far-silhouette offsets).
- `anim.ts` `AnimGroup`: all animations run with `fill: forwards`; on finish (natural or `finishAll`) the `onEnd` callback writes the final state to inline style, then the animation is cancelled. Always commit end state in `onEnd` when adding animations.
- `paw.ts` `PawView` tracks the current `pose` string so the next swing starts from wherever the paw is.
- `objectView.ts` uses two alternating slots for current/flying object and two ghost slots for the far silhouette, plus HP pips.
- `portrait.ts` draws the face parametrically via `renderFace(level, cat)` (no SVG symbols); hats, glasses, moustaches and hairdos live in `accessory()` (returns `keepEars` for anything that is not a hat), breed marks in `markings()`.
- `fx.ts` `Fx`: impact burst, speed lines, claw marks, shards, hit text, spell bolt, focus ring.

### Platform (`src/platform/`)
- `telegram.ts` wraps `window.Telegram.WebApp` with browser fallbacks; `isTma()` is true only when `initData` is non-empty. Newer Bot API features are gated with `isVersionAtLeast`. `USE_FULLSCREEN` is intentionally off. `Sheet` (`ui/sheet.ts`) hooks the Telegram BackButton.
- `storage.ts`: `SaveV1` persists to `localStorage['drummercat.save']` always and to CloudStorage key `save` in Telegram. On load both are read and merged with `pickNewer` (higher `knocked`, then `updatedAt`), then written back to both. Writes are debounced 500 ms and flushed on `visibilitychange`/`pagehide`. Migrations go through `normalizeSave` keyed on `v`.
- `audio.ts` synthesizes all SFX with Web Audio (no audio files); `unlock()` must run inside a user gesture.

### Dev hooks
In dev builds `window.__dc` exposes `renderFace`, `CATS`, `SETS` for console experiments.

## Adding content

Two project skills in `.claude/skills/` hold the full workflow, coordinate references, and scaffold scripts that perform all registration edits (types union, save whitelist, lists, sprite imports) and leave `TODO(<id>)` markers for the art:
- `add-cat-skin` — new cat: palette, paw symbol, portrait markings/accessory, strike style. Script: `node .claude/skills/add-cat-skin/scripts/scaffold-cat.mjs`.
- `add-object-set` — new set ("level"): 10 objects with damage layers, background, set file. Script: `node .claude/skills/add-object-set/scripts/scaffold-set.mjs`.

Short manual checklist (README.md has the full version):
- **Object**: draw `<symbol id="obj-<id>">` in `src/content/svg/<set>.svg` (4px `#1F1A17` stroke, flat fills, no gradients/filters), add damage groups for hp > 1, then add the entry to `src/content/sets/<set>.ts`.
- **Cat**: entry in `cats.ts`, `#paw-<id>` symbol in a paws sprite, portrait markings/accessory in `render/portrait.ts`, new id in `types.ts` and `normalizeSave`.
- **Strike**: new `StrikeStyle` in `strikes.ts` and its id in `StrikeId`; the existing tests cover it automatically.
