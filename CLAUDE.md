# CLAUDE.md — Buzzwords.gg Codebase Guide

Buzzwords.gg is a multiplayer hexagonal word game ("Scrabble meets Go") where players place words on a hex grid to capture territory. This guide documents the codebase structure, development workflows, and conventions for AI assistants.

---

## Repository Structure

This is a **Yarn 4 monorepo** with three workspaces:

```
buzzwords/
├── client/          # React + TypeScript web/Electron/iOS client
├── server/          # Node.js + Express + Socket.io backend
├── shared/          # Shared game logic (imported by both client and server)
├── Dockerfile       # Multi-stage server container build
├── docker-compose.yml
├── package.json     # Root workspace config
└── .github/workflows/electron.yaml  # CI/CD for Electron releases
```

---

## Technology Stack

### Backend (`server/`)
- **Runtime**: Node.js v20 (see `.nvmrc`)
- **Framework**: Express 4.x + Socket.io 4.x (real-time multiplayer)
- **Database**: MongoDB 4.x via Mongoose 6.x (supports in-memory mode for dev)
- **Auth**: Passport.js with Google OAuth2
- **Push notifications**: Firebase Admin SDK
- **Observability**: OpenTelemetry → Honeycomb (traces, logs, metrics)
- **Build**: esbuild (bundles to `dist/index.js`)
- **Test runner**: Jest with ts-jest

### Frontend (`client/`)
- **Framework**: React 18 + Redux Toolkit + React Router v6
- **Build tool**: Vite 3
- **3D graphics**: Three.js 0.143 + React Three Fiber
- **Styling**: Tailwind CSS 3
- **Desktop**: Electron 31
- **Mobile**: Capacitor 4 (iOS)
- **Forms**: Formik + Yup

### Shared (`shared/`)
- Pure TypeScript game logic — no framework dependencies
- Uses Ramda for functional utilities
- Imported directly by both client and server via Yarn workspaces

---

## Development Setup

### Prerequisites
- Node.js v20.9.0 (use `nvm use` or match `.nvmrc`)
- Yarn 4.5.3 (`corepack enable && corepack prepare`)

### Install
```bash
yarn install   # installs all workspace dependencies from root
```

### Running locally
```bash
# Terminal 1 — backend (localhost:8080)
yarn dev:server

# Terminal 2 — frontend (localhost:5173, proxies /api and /socket.io to :8080)
yarn dev:client
```

### Interacting with the game in the browser (Claude)

When testing or developing features that require interacting with the game UI, use the **Claude Chrome Extension** browser tools. This allows you to navigate to the local dev server, click on game elements, take screenshots, and verify UI behavior directly in Chrome.

Key workflow:
1. Ensure dev servers are running (see below).
2. Navigate to `http://localhost:5173` in the browser.
3. Use the Chrome extension tools to inspect, interact with, and screenshot the game UI.

Prefer browser interaction over manual testing instructions whenever you need to verify UI changes end-to-end.

---

### Running dev servers for testing/development (Claude)

When you need the dev servers running to test or develop a feature, start both as background tasks:

```bash
# From server/ directory
cd server && yarn dev

# From client/ directory
cd client && yarn dev
```

Use `run_in_background: true` for both. The server starts on port 8080 and the client on port 5173. The server uses ts-node so takes ~10 seconds to be ready. To check if they're running, use `lsof -i :8080 -i :5173 | grep LISTEN`.

Create `server/.env` with at minimum:
```
API_PREFIX=/api
```

For full auth/DB functionality also set: `MONGO_URL`, `MONGO_DB_NAME`, `DB_TYPE=mongo`, `COOKIE_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`.

### Electron desktop
```bash
cd client && yarn dev-electron
```

---

## Key Commands

### Root
| Command | Description |
|---------|-------------|
| `yarn dev:client` | Start Vite dev server |
| `yarn dev:server` | Start server with nodemon |
| `yarn build` | Build client + server concurrently |

### Server (`cd server`)
| Command | Description |
|---------|-------------|
| `yarn dev` | nodemon + ts-node (watches `src/` and `../shared/`) |
| `yarn build` | esbuild → `dist/index.js` |
| `yarn test` | Jest |
| `yarn test:watch` | Jest watch mode |
| `yarn lint` | ESLint |

### Client (`cd client`)
| Command | Description |
|---------|-------------|
| `yarn dev` | Vite dev server |
| `yarn dev-electron` | Vite + Electron |
| `yarn build` | Vite production build → `dist/` |
| `yarn dist` | electron-builder packaging |
| `yarn lint` | ESLint |

---

## Architecture Deep-Dive

### Server source (`server/src/`)
```
index.ts          — Entry point: loads env, tracing, starts server
server.ts         — Express + Socket.io wiring, auth middleware, routes
config.ts         — All env-var configuration in one place
types.ts          — DataLayer interface (abstraction over mongo/memory)
GameManager.ts    — Core game orchestration: moves, passes, forfeits, validation
words.ts          — Word list loading & validation helpers
tracing.ts        — OpenTelemetry setup
routes/
  game.ts         — Game CRUD, joining, making moves
  user.ts         — Auth, nicknames, profiles
  admin.ts        — Admin operations
  pushToken.ts    — Firebase push token registration
datalayer/
  index.ts        — Factory: returns memory or mongo implementation
  memory.ts       — In-memory store (great for dev/testing)
  mongo/
    index.ts      — Mongoose-based persistence
    models.ts     — MongoDB schemas
migrations/       — Versioned DB migration runner
```

**DataLayer pattern**: All DB access goes through the `DataLayer` interface defined in `types.ts`. Swap implementations via `DB_TYPE` env var (`mongo` or leave unset for in-memory). When adding new persistence needs, add methods to the interface and implement in both `memory.ts` and `mongo/index.ts`.

### Client source (`client/src/`)
```
main.tsx                 — React entry, Redux Provider
app/
  App.tsx                — Root router
  store.ts               — Redux store (game, gamelist, user, settings slices)
  Api.ts                 — Axios wrapper with auth token headers
  socket.ts              — Socket.io client, event bindings
  firebase.ts            — Firebase init
features/                — Redux feature slices + route components
  game/                  — Game board state, move selection logic
  gamelist/              — User's game list
  canvas/                — Three.js 3D rendering
  hexGrid/               — Hex coordinate utilities
  auth-route/            — Google OAuth flow
  create-game-route/
  play-game-route/
  home-route/
  user/
  settings/
  thereed-lettering/     — 3D text rendering
  move-list/             — Move history / replay
presentational/          — Shared UI components
electron/
  main/index.ts          — Electron main process, window management
  preload/index.ts       — IPC bridge (contextBridge)
```

### Shared library (`shared/`)
```
Game.ts          — Game and Move type definitions
types.ts         — HexCoord type
hexgrid.ts       — Hex grid generation, neighbor detection
cell.ts          — Cell/tile structure
gridHelpers.ts   — Territory capture calculation
alphaHelpers.ts  — Word validation, random character generation
bot.ts           — AI move generator (difficulty 1–5)
utils.ts         — shuffle, random, combinations
```

**Important**: Changes to `shared/` are consumed by both client and server. The server's nodemon config watches `../shared/` for hot-reload.

---

## Game Mechanics Overview

- Board: Hexagonal grid. Each cell has a letter and an owner.
- Turn: A player selects adjacent cells to spell a valid English word (≥ 3 characters). Played cells capture territory.
- Territory: After a move, `gridHelpers.ts` recalculates ownership using flood-fill logic (like Go).
- Word validation: Against `words.json` (~2.4MB dictionary) and filtered through `banned_words.json`.
- Bot: `shared/bot.ts` generates AI moves. Difficulty affects move selection strategy.
- Win condition: Determined by territory control when the game ends.

---

## API & WebSocket Reference

### REST API (prefixed with `API_PREFIX`, default `/api`)
```
GET  /healthz                         Health check
GET  /login/google                    Start Google OAuth
GET  /login/google/redirect           OAuth callback
POST /logout
GET|POST /game/*                      Game CRUD + moves
GET|POST /user/*                      Profile, nicknames
POST /pushToken/*                     Firebase tokens
GET|POST /admin/*                     Admin operations (requires ADMIN_API_KEY)
```

### WebSocket (Socket.io)
Game state is synchronized in real-time. Key events:
- Game state updates (after moves/passes/forfeits)
- Turn change notifications
- Gamelist updates
- Nickname changes

---

## Database

- **Development**: In-memory (default, no config needed) — state lost on restart.
- **Production**: MongoDB with a **replica set** (required for transactions).
- Transactions are used to ensure game state consistency during moves.

---

## Testing

Tests live in `server/src/alphaHelpers.test.ts`. Run with:
```bash
cd server && yarn test
```

When adding game logic to `shared/alphaHelpers.ts` or related files, add corresponding tests. The test framework is Jest + ts-jest.

---

## CI/CD

`.github/workflows/electron.yaml` triggers on tags matching `client-*`:
1. Builds Electron app on Linux (`.snap`), Windows (`.exe`), and macOS (`.dmg`)
2. Uploads artifacts to GitHub Releases
3. Publishes to itch.io via Butler CLI

Required repository secrets: `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLEID`, `APPLEIDPASS`, `APPLETEAMID`, `BUTLER_CREDENTIALS`.

---

## Deployment

- **Platform**: DigitalOcean App Platform (`app-spec.yaml`)
- **Database**: MongoDB Atlas (replica set)
- **Container images**:
  - `chuckdries/buzzwords-server` — multi-arch Node.js 20 slim
  - `chuckdries/buzzwords-web` — multi-arch Nginx static site
- **Domain**: buzzwords.gg

Build Docker images:
```bash
yarn docker-server   # multi-platform server image
yarn docker-client   # multi-platform client image
```

---

## Code Conventions

### TypeScript
- Strict mode enabled in both client and server.
- All new code should be TypeScript — no plain `.js` files in `src/`.
- Types shared between client and server go in `shared/`.

### Formatting
- Prettier is configured at root (`.prettierrc.json`) — run before committing.
- ESLint is configured per-package (`.eslintrc.js` in `client/` and `server/`).

### State management (client)
- Use Redux Toolkit slices in `features/<name>/`.
- Async operations use Redux Thunk (`createAsyncThunk`).
- Socket.io events are handled in `app/socket.ts` and dispatch Redux actions.

### DataLayer (server)
- Never access MongoDB models directly from route handlers — always go through the `DataLayer` interface.
- Both the memory and mongo implementations must stay in sync when adding new methods.

### Shared code
- Keep `shared/` dependency-free except Ramda.
- Do not import from `client/` or `server/` inside `shared/`.

### Pure functions
- Prefer pure functions (no side effects) whenever possible. If logic can be expressed as a transformation of inputs to outputs without mutating state or depending on external state, write it that way.
- Always add tests for newly created pure functions. Tests live in `server/src/alphaHelpers.test.ts` (or a new `*.test.ts` file alongside the module). Use Jest.

---

## Testing

Always run `yarn test` from the `server/` directory before considering any change complete. All tests must pass.

```bash
cd server && yarn test
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `API_PREFIX` | Yes | Route prefix, e.g. `/api` |
| `DB_TYPE` | No | Set to `mongo` for MongoDB; omit for in-memory |
| `MONGO_URL` | If `DB_TYPE=mongo` | MongoDB connection string |
| `MONGO_DB_NAME` | If `DB_TYPE=mongo` | Database name |
| `COOKIE_SECRET` | Prod | Secret for signed cookies |
| `COOKIE_DOMAIN` | Prod | Domain for auth cookies |
| `GOOGLE_CLIENT_ID` | Prod | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Prod | OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Prod | OAuth redirect URL |
| `ADMIN_API_KEY` | Prod | Admin route access token |
| `ENABLE_PUSH_NOTIFICATIONS` | No | Enable Firebase push |
| `NOTIFICATION_GAME_BASE_URL` | If push enabled | Deep link base URL |
