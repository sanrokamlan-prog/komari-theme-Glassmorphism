# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Komari Monitor theme called **Komari Emerald**, built with Vue 3 + Vite. The release artifact is a zip Komari can import, **not** a generic deployed web app. [komari-theme.json](komari-theme.json) is release input, not optional metadata.

## Commands

Use `bun` (the `engines` field pins bun >= 1.2 + Node 20.19/22.12+; `packageManager` is `bun`). Run from repo root.

```bash
bun run dev       # Vite dev server, proxies /api to https://tz.osid.cn
bun run build     # type-check (vue-tsc --build) + vite build + zip packaging
bun run preview   # preview production build
bun run lint      # eslint --fix --cache
```

There is **no test suite**. Do not invent `bun test` / Vitest commands. CI ([.github/workflows/build-ci.yml](.github/workflows/build-ci.yml)) only runs `bun install --frozen-lockfile && bun run build` and uploads `komari-theme-emerald-build*.zip`.

## Build & release contract

`bun run build` must preserve the Komari packaging flow defined by the `komariThemeZip` plugin in [vite.config.ts](vite.config.ts). After a successful build, the repo root must contain:

- `dist/`
- `komari-theme-emerald-build-<short-sha>.zip` (commit hash from `git rev-parse --short HEAD`)

Zip layout — **do not change names**:

```
komari-theme.json   (from repo root)
preview.png         (renamed from docs/preview.png)
dist/               (Vite output)
```

Vite injects two build-time constants via `define`: `__BUILD_VERSION__` (from [komari-theme.json](komari-theme.json), the single release-version source) and `__BUILD_GIT_HASH__`. Both are declared in [src/types/global.d.ts](src/types/global.d.ts) and may be referenced as globals in source.

Manual chunks are configured in [vite.config.ts](vite.config.ts): `vue-vendor`, `echarts`, `reka-ui`, `vueuse`. Keep them aligned with actual usage when adding/removing large deps.

## UI stack (current — there is **no Naive UI** here)

- **Components**: a local shadcn-vue-style library in [src/components/ui/](src/components/ui/) (alert, avatar, back-top, badge, button, card-x, empty, input, progress-thin, sonner, spinner, tabs, tooltip) built on `reka-ui` primitives. Variants typed with `class-variance-authority`; class composition via `cn()` in [src/lib/utils.ts](src/lib/utils.ts) (clsx + tailwind-merge).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`, configured CSS-first in [src/styles/main.css](src/styles/main.css) with OKLCH design tokens and a `dark` variant. Animations from `tw-animate-css`. **No SCSS, no UnoCSS.**
- **Dark mode**: driven by `useAppStore().themeMode` + `useDark()` from `@vueuse/core` (storage key `vueuse-color-scheme`); toggles a `.dark` class on `<html>`. Provider setup in [src/components/Provider.vue](src/components/Provider.vue).
- **Toasts**: `vue-sonner` `<Toaster>` mounted in [src/App.vue](src/App.vue); exposed app-wide as `window.$message` via [src/utils/message.ts](src/utils/message.ts).
- **Globals**: only `window.$message` exists. There is **no** `$dialog`, `$notification`, `$loadingBar`, or `$modal`.
- **Icons**: `@iconify/vue` (`<Icon icon="..." />`, lazy CDN fetch — see [src/utils/iconify.ts](src/utils/iconify.ts)). Lucide icons are available via the `lucide:` prefix (e.g. `lucide:x`). **Do not** reintroduce `lucide-vue-next` or any other icon-as-component package.
- **Other**: `cobe` powers the 3D globe in `NodeEarthGlobe`; `echarts` + `vue-echarts` for charts.

## Architecture

### App shell

- [src/main.ts](src/main.ts) is bootstrap only — installs Pinia, router, global styles, sets `window.$message`, kicks off `setupIconify()`. Do not put feature logic here.
- [src/App.vue](src/App.vue) owns the layout, mounts the `<Toaster>` and `Provider`, runs `initApp()` / `destroyInitManager()` from [src/utils/init.ts](src/utils/init.ts), and `KeepAlive`s `HomeView`.
- [src/router/index.ts](src/router/index.ts) defines exactly two lazy routes: `/` → `HomeView`, `/instance/:id` → `InstanceDetail`. There are no router guards.

### State (Pinia setup stores)

- [src/stores/app.ts](src/stores/app.ts) — public settings, theme-derived config, login state, layout flags, formatting prefs, theme mode. `publicSettings.theme_settings` comes from Komari and **must** be parsed defensively (`typeof` checks, guarded `JSON.parse`, valid-value filtering, defaults). The schema is declared in [komari-theme.json](komari-theme.json) under `configuration.data`.
- [src/stores/nodes.ts](src/stores/nodes.ts) — normalized nodes, group derivation, WebSocket state, live updates.
- Components/views should read from stores; do not maintain parallel state for the same domain.

### Transport & startup

- API/RPC live in [src/utils/api.ts](src/utils/api.ts) and [src/utils/rpc.ts](src/utils/rpc.ts) (notes in [src/utils/rpc.md](src/utils/rpc.md)).
- Transport selection, polling, reconnects, and the websocket→http fallback all live in [src/utils/init.ts](src/utils/init.ts). Transport mode is user-configurable via `rpcTransportMode` in the theme manifest.
- Formatting/lookup helpers: `helper.ts`, `recordHelper.ts`, `regionHelper.ts`, `osImageHelper.ts`, `tagHelper.ts`. Reuse these — do not duplicate parsing/formatting in components.

### Views & components

- Heavy node/chart UI (`NodeCard`, `NodeList`, `NodeGeneralCards`, `LoadChart`, `PingChart`) is loaded with `defineAsyncComponent` from views. Keep them presentation-focused.
- Keep `defineOptions({ name: 'HomeView' })` on `HomeView` so `App.vue`'s `KeepAlive :include="['HomeView']"` keeps working.
- When building new UI, **prefer composing existing primitives from `src/components/ui/`** over hand-rolling another component. If a primitive is missing, follow the same shadcn-vue pattern (reka-ui + cva + `cn()`).

### Runtime asset contract

[public/images/](public/images/) filenames are part of the runtime contract — code builds paths from runtime values rather than importing assets:

- `flags/<UPPERCASE_CODE>.svg` consumed by `getRegionCode()` in [src/utils/regionHelper.ts](src/utils/regionHelper.ts). Casing matters.
- `logo/os-*.{svg,png,ico}` returned exactly by `getOSImage()` in [src/utils/osImageHelper.ts](src/utils/osImageHelper.ts). Mixed case and non-SVG extensions there are intentional — do not normalize.

Renaming, moving, or removing files under `public/images/` is a **code change**: check references under `src/` and update helper mappings first.

## Conventions

- Composition API with `<script setup lang="ts">`.
- `@/` alias → `src/` (defined in [vite.config.ts](vite.config.ts) and tsconfig).
- Lint stack: ESLint (`@antfu/eslint-config`). Run `bun run lint` before committing.
- Dependency versions are declared directly in [package.json](package.json) (no workspace catalog). Add new deps with `bun add` / `bun add -d`.

## Repo-grounded anti-patterns

- Do not rename `komari-theme.json`, `docs/preview.png`, or the zip naming pattern `komari-theme-emerald-build-<sha>.zip`.
- Do not embed ad-hoc parsing of `theme_settings` inside components — normalize once in `stores/app.ts`.
- Do not reintroduce Naive UI, UnoCSS, or SCSS — the project has migrated to reka-ui + Tailwind v4. Compose `src/components/ui/*` instead of pulling in a new component library.
- Do not reintroduce `lucide-vue-next` (or any other icon-as-component package). All icons go through `@iconify/vue`; lucide icons are available via the `lucide:` prefix.
- Do not add matrix builds, release automation, or test stages to CI without a concrete need (see [.github/AGENTS.md](.github/AGENTS.md)).
- Do not duplicate AGENTS.md content here. The nearest `AGENTS.md` overrides this file for its subtree:
  - [AGENTS.md](AGENTS.md) — root build/packaging
  - [src/AGENTS.md](src/AGENTS.md) — app code rules
  - [.github/AGENTS.md](.github/AGENTS.md) — CI and issue templates
  - [public/images/AGENTS.md](public/images/AGENTS.md) — asset filename contract
