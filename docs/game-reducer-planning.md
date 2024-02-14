# The Gameplay Reducer
Project to refactor shared game manager to redux reducer

### features
- compact incremental game serialization
- easy to integrate in client and server = fewer bugs from differences between the two
- easy to unit test

### game loop
1. secondary submits move to primary. primary echoes move to all nodes. all nodes set game to `pending-move`.
2. primary evaluates move for validity and derives resulting board state. if it rejects move, all clients undo previous update
3. primary issues `moveExecuted` message with input data and immer patches
4. all nodes serialize move and derive updated gameplay state from patch set (always)
- only distinction between online and offline mode is whether "submit move" makes API call or simply calls gameplay reducer directly

Progress: exploring implementation in `shared/GameplaySlice.ts`

Notes:
- rtk entityadapters may be helpful for updating games in memory on client?
- gameplay reducer should use plain immer so we can serialize patches
- RTKquery has built in .undo on top of patches - use this for adding and removing pending state?
  - https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates
- https://immerjs.github.io/immer/patches

TODO
- [ ] migration of existing db game objects  (translate for now, migrate later?)