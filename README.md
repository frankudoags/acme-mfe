# Acme Store — Micro-Frontend Monorepo

A project demonstrating micro-frontends with **Module Federation** (Vite), a
**Rust** backend, **MySQL**, and a fully containerized local setup via **Docker Compose**.

## Architecture

```
apps/
├── shell/        # Host: routes + composes the remotes (Vite, React Router)
├── header/       # Remote: nav bar + cart badge
├── products/     # Remote: catalog (React Query data fetching)
└── cart/         # Remote: cart UI + checkout (React Query mutation)

backend/          # Rust (Axum) API + MySQL

packages/         # single workspace package "@acme/packages"
├── package.json  # ONE merged manifest for shared + ui
├── index.ts      # re-exports everything
├── shared/src/
│   ├── stores/cart.store.ts   # Zustand cart store (shared singleton)
│   ├── api/                   # typed API client (http, products, cart)
│   ├── query.tsx              # React Query provider + client
│   └── types.ts
└── ui/src/
    ├── ui/                    # shadcn components (Button, Card, Badge, Input)
    └── lib/utils.ts           # cn() helper
```

### How it fits together

- **Module Federation** shares `react`, `react-dom`, and `@acme/packages` at runtime.
  Because `@acme/packages` is a singleton, the **Zustand cart store** lives in one
  instance — the header badge, products "add", and cart all stay in sync across remotes.
- Each remote exposes `./App` and is served independently (own nginx container).
- The **shell** lazy-loads each remote via `import('products/App')` and wires them into
  routes.
- **React Query** fetches from the Rust API; the shared `queryClient` is also a singleton
  so caching/invalidation works across remotes.

## Prerequisites

- Node 20+ and pnpm (`npm i -g pnpm`)
- Rust toolchain (only for local backend dev)
- Docker + Docker Compose

## Run locally (dev)

```bash
pnpm install

# terminal 1 — start MySQL (via docker)
docker compose up -d mysql

# terminal 2 — start backend
cd backend
cargo run

# terminal 3 — start all frontends (shell + 3 remotes)
pnpm dev
```

Open http://localhost:5005

| App      | URL                    |
| -------- | ---------------------- |
| Shell    | http://localhost:5005  |
| Header   | http://localhost:5001  |
| Products | http://localhost:5002  |
| Cart     | http://localhost:5003  |
| API      | http://localhost:8080  |

> The backend reads `DATABASE_URL` (default `mysql://root:root@localhost:3306/acme`).
> For local dev point it at the dockerized MySQL: `127.0.0.1:3306`.

## Run everything in Docker

```bash
pnpm docker:up     # = docker compose up -d --build
```

This builds and runs: `mysql`, `backend`, `header`, `products`, `cart`, `shell`.

The shell is built with remote URLs pointing at the mapped host ports
(`http://localhost:5001/assets/remoteEntry.js`, etc.) via build args in
`docker-compose.yml`. Because module resolution happens in the **browser**, the remotes
are reached through localhost, not container names.

Stop with `pnpm docker:down`.

## Key files

- `apps/shell/vite.config.ts` — how the host declares remotes
- `apps/products/vite.config.ts` — how a remote exposes `./App` and shares deps
- `packages/shared/src/stores/cart.store.ts` — the shared Zustand store
- `packages/shared/src/api/http.ts` — typed fetch wrapper
- `backend/src/main.rs` — Axum routes + MySQL via sqlx
- `docker-compose.yml` — multi-service build with MySQL healthcheck
