import { Client } from "boardgame.io/react";
import { Local } from 'boardgame.io/multiplayer';
import { TutorialBuzzwords } from "buzzwords-shared/Tutorial";
import { BGIOGameBoard } from "./BGIOGameBoard";
import "./BGIOClient.css";

const App = Client({
  game: TutorialBuzzwords,
  board: BGIOGameBoard,
  debug: false,
  multiplayer: Local({
    persist: true,
  }),
  numPlayers: 2,
});

export default App;
