# The Game Reducer
Project to refactor shared game manager to redux reducer

### features
- compact incremental game serialization
- easy to integrate in client and server = fewer bugs from differences between the two
- easy to unit test
- serialize and socket-send actions verbatim
- messages are bucketed into `game command` and `state update`

### game loop
1. when player makes move, client emits `game command` message
2.  primary node (server) and secondary nodes (clients) all evaluate validity and derive resulting board state on their own. no RNG happens in this step
3. board is now in "pending" state
4. primary node performs RNG to set up next turn and broadcasts `state update` message
5. secondary nodes simply serialize updated state
- when in offline mode, client simply acts as primary node
