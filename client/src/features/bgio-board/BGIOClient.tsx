import { Client } from "boardgame.io/react";
import { Buzzwords } from "buzzwords-shared/Buzzwords";
import { BGIOGameBoard } from "./BGIOGameBoard";
import "./BGIOClient.css";
const App = Client({ game: Buzzwords, board: BGIOGameBoard });

export default App;
