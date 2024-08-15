# The Gameplay Reducer
Project to refactor shared game manager to redux reducer

### features
- compact incremental game serialization
- easy to integrate in client and server = fewer bugs from differences between the two
- easy to unit test

## Plan
1. Client only hotseat
  - defines v2 game schema(?)
  - core non-bot game logic entirely implemented in shared reducer
  - games serialize to localstorage
2. Server side and datalayer
  - new games use v2 schema
  - v2 games go through shared reducer
  - can we send whole game deltas over the wire?
3. Migrate active games?

## Notes
Updated game schema?:
- necessary to take advantage of more compact Move.grid storage
- grid -> gridDeltas?
  - just the diffs of the grid obj so we can recreate the board state of any turn without duplicating tiles that don't change

Game schema migration?
- do we care about leaving old codepaths around for old clients?
  - (I'm thiiiiiinking about ditching electron in favor of tauri anyway...)

## scratchpad
- first attempt: explored in `shared/GameReducer1.ts`
  - big changes to schema
  - patches only over the socket
  - called by server's existing game move route
    - for convenience - did not occur to me to try idea with hotseat
- DOING round 2: `shared/GameReducer2.ts`
  - reuse existing interfaces/types, just return extra stuff?
  - attempt to implement client-only for hotseat (maybe that'll be simpler?)

## old scribbles
- rtk entityadapters may be helpful for updating games in memory on client?
- gameplay reducer should use plain immer so we can serialize patches
- RTKquery has built in .undo on top of patches - use this for adding and removing pending state?
  - https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates
- https://immerjs.github.io/immer/patches
