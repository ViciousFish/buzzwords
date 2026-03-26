# CLAUDE.md — Server: Bot Logic

This document explains how the AI bot works in Buzzwords.gg, covering the
algorithm in `shared/bot.ts`, the scoring model, difficulty scaling, and how
the server invokes the bot via `GameManager`.

---

## Overview

The bot is a **single-function AI** exported from `shared/bot.ts`:

```ts
getBotMove(grid: HexGrid, options: { difficulty, words, bannedWords }): HexCoord[]
```

It returns an ordered array of hex coordinates representing the word the bot
wants to play. The server calls this after every human move in a vs-AI game.

---

## Tile Classification

Before scoring words, the bot classifies every available neutral tile (`owner == 2`, non-capital, non-empty) into three priority tiers:

| Tier | Variable | Meaning | Score multiplier |
|------|----------|---------|-----------------|
| 0 | `nonNeighborTiles` | Neutral tiles with no adjacency to either player | `× 10⁰ = ×1` |
| 1 | `nonCapitalNeighbors` | Neutral tiles adjacent to the **human's** territory (but not their capital) | `× 10¹ = ×10` |
| 2 | `capitalNeighbors` | Neutral tiles adjacent to the **human's capital** | `× 10² = ×100` |

Each list is **shuffled** before use so that moves within the same tier are
chosen randomly, preventing repetitive play.

**Key insight**: a tile adjacent to the human's capital is worth 100× more
than a non-adjacent tile. This drives the bot to attack the opponent's capital.

---

## Scoring a Word

For each word in the dictionary the bot tries to "claim" its letters from the
available tiles (consuming each tile once):

```
score = 1
for each letter in word:
    find matching tile (consume it from available pool)
    score += 1                          # length bonus
    score *= 10^(tier of that tile)     # territory bonus
```

The multiplicative tier bonus means a single capital-adjacent tile can
dominate the score. Longer words also score higher when all else is equal.

Words that cannot be formed from available tiles are skipped entirely.

---

## Difficulty & Word Length

Difficulty (`1`–`10`) controls the **maximum word length** the bot will
attempt, via a linear normalization:

```ts
normalize(difficulty + jitter, 1, 10, 3, min(openTiles, 12)) - 2
```

- Maps difficulty `1–10` → target length `3–12` (capped at available tiles).
- **Jitter**: `±1` random offset per turn for natural variance.
- Result is clamped to `[3, openTiles]`.

The bot then searches for the highest-scoring word **at or below that length**,
stepping down from `maxWordLength` to `3` until it finds a valid option.

At difficulty 1 the bot plays short 3-letter words. At difficulty 10 it
targets words up to 12 letters, often capital-adjacent.

---

## Final Word Selection

Within a given length bucket, the bot picks **near-randomly from the top 5**
scoring words (not always the absolute best). This prevents deterministic
play while still favouring good moves at higher difficulties:

```ts
sortedWordScores[sortedWordScores.length - getRandomInt(1, min(sortedWordScores.length, 5))]
```

---

## Server Integration

The bot is invoked in `server/src/routes/game.ts` after a human player makes
a valid move in a `vsAI` game. The flow is:

1. Human move is validated and applied by `GameManager.makeMove()`.
2. If `game.vsAI && !game.gameOver`, the server calls `getBotMove(grid, { difficulty, words, bannedWords })`.
3. The returned coordinates are passed back into `GameManager.makeMove()` under the bot's user ID.
4. Updated game state is persisted and broadcast via Socket.io.

**Owner convention used by the bot**:
- `owner == 0` → human player (player 0)
- `owner == 1` → bot / player 1
- `owner == 2` → neutral tile

The bot reads `cell.owner == 2` for playable tiles and `cell.owner == 1` for
its own capital (`c.capital == true`).

---

## Related Files

| File | Role |
|------|------|
| `shared/bot.ts` | Core bot algorithm (`getBotMove`) |
| `shared/alphaHelpers.ts` | `normalize()` used for difficulty scaling; `isValidWord()` |
| `shared/hexgrid.ts` | `getCellNeighbors()` — used to find capital neighbors |
| `shared/gridHelpers.ts` | Territory capture helpers (post-move, not used by bot directly) |
| `server/src/GameManager.ts` | Validates and applies moves; also invoked for bot turns |
| `server/src/words.ts` | Loads `words.json` and `banned_words.json` into objects passed to bot |
| `server/src/routes/game.ts` | HTTP/socket handlers that trigger bot moves |

---

## OpenTelemetry Tracing

`shared/bot.ts` emits an `getBotMove.analyze` span (server-side only — the
import is guarded by an environment check) with the following attributes:

| Attribute | Value |
|-----------|-------|
| `bot.difficulty` | Difficulty setting |
| `bot.openTilesCount` | Available neutral tiles |
| `bot.wordsAnalyzed` | Total dictionary words checked |
| `bot.validWordsFound` | Words formable from current tiles |
| `bot.maxWordLength` | Length ceiling after jitter |
| `bot.selectedWordLength` | Actual length chosen |
| `bot.selectedWordScore` | Score of chosen move |
| `bot.selectedWord` | Letters of chosen move |

Traces are exported to Honeycomb via the OpenTelemetry setup in `server/src/tracing.ts`.

---

## Adding or Changing Bot Behaviour

- **Change difficulty curve**: adjust the `normalize()` call in `bot.ts` (the
  `toMin`/`toMax` arguments map difficulty to word length range).
- **Change scoring**: edit the `score *= Math.pow(10, i)` line; the tier
  indices (`0`, `1`, `2`) map to the `coordTypes` array order.
- **Add a new tile tier**: push another filtered list onto `coordTypes` and
  update the multiplier accordingly.
- **Make bot avoid certain words**: pass additional entries in `bannedWords`;
  the bot already skips words shorter than 3 characters.
- **Client-side bot**: `getBotMove` is pure TypeScript with no Node.js
  dependencies (OpenTelemetry is opt-in via environment check), so it can be
  bundled into the client as-is for offline play.
