import { Client } from "boardgame.io/react";
import { TutorialBuzzwords } from "buzzwords-shared/Tutorial";
import { BGIOGameBoard } from "./BGIOGameBoard";
import "./BGIOClient.css";
const App = Client({ game: TutorialBuzzwords, board: BGIOGameBoard });

export default App;
