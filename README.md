# frontend-flare

Boilerplate for building Next.js applications with [`@zuzjs/ui`](https://github.com/zuzpk/zuzjs-ui) and [`@zuzjs/flare`](https://github.com/zuzpk/zuzflare-ts) — the Zuz realtime auth and data layer.

This app lives inside the `@zuz-js` monorepo and consumes workspace packages directly.

## Stack

- **Next.js** (custom webpack build via `zuz.js`)
- **@zuzjs/ui** — component library
- **@zuzjs/flare** — realtime client (WebSocket/Flare protocol)
- **@zuzjs/flare-admin** — admin utilities for Flare
- **@zuzjs/store** — global state management
- **@zuzjs/hooks** — shared React hooks
- **@zuzjs/core** — shared utilities and types
- **SCSS** — theming via `src/app/css/`

## Getting Started

Install dependencies from the monorepo root:

```bash
pnpm install
```

Then start the dev server for this app:

```bash
pnpm dev
```

This runs three processes concurrently:
- `zuzjs watch` — watches and rebuilds `@zuzjs/ui` component styles
- `node zuz.js mode=dev` — Zuz asset pipeline in dev mode
- `next dev -p 3000 --webpack` — Next.js dev server on port 3000

## Environment

Copy `.env` and fill in your values:

| Variable | Description |
|---|---|
| `FLARE_INTERNAL_USER_TOKEN` | Server-side token for internal Flare API calls |
| `NEXT_PUBLIC_APP_ORIGIN` | Public origin URL (falls back to `VERCEL_URL` or config) |

The Flare connection is configured in `src/flare-config.ts`. Update `FLARE_APP_ID`, `FLARE_API_KEY`, and `FLARE_SERVER_URL` to point at your Flare instance.

## Project Structure

```
src/
  app/
    (authenticated)/   # Routes requiring auth
    (guest)/           # Public routes
    api/               # Next.js route handlers (auth, flare proxy)
    css/               # Global SCSS theme files
  config.ts            # App-level config (URLs, constants)
  flare-config.ts      # Flare connection config
  flare.ts             # Flare client initialization
  store.ts             # Global store setup
  routes.ts            # Typed route definitions
  types.ts             # Shared TypeScript types
```

## Building

```bash
pnpm build
```

Runs the Zuz production asset pipeline then `next build`.

## Linting

```bash
pnpm lint
```
