# The Gameplay Reducer
Project to refactor shared game manager to redux reducer

### features
- compact incremental game serialization
- easy to integrate in client and server = fewer bugs from differences between the two
- easy to unit test

### game loop
1. secondary submits move to primary. primary echoes move to all nodes. all nodes serialize move and set game to `pending-rng`.
2. primary evaluates move for validity and derives resulting board state. if it rejects move, all clients undo previous update
3. primary issues `state update` message with new board state and updated tile values
  - see if we can serialize and send the diff from immer - maybe requires ditching rtk?
4. all node serialize state update and set game to playable
- only distinction between online and offline mode is whether "submit move" makes API call or simply calls gameplay reducer
