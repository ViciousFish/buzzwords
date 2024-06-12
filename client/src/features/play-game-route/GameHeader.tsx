import React from "react";
import {
  faEllipsisV,
  // faShareSquare,
  // faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Game from "buzzwords-shared/Game";
import copy from "copy-to-clipboard";
import {
  Button,
  Menu,
  MenuTrigger,
  MenuItem,
  Popover,
} from "react-aria-components";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { forfeitGame } from "../gamelist/gamelistActions";
import { getAllUsers } from "../user/userSelectors";
import { getGameUrl } from "./PlayGame";
interface GameHeaderProps {
  game: Game;
}

const GameHeader: React.FC<GameHeaderProps> = ({ game }) => {
  const users = useAppSelector(getAllUsers);
  const p1Nick = users[game.users[0]]?.nickname;
  const p2Nick = game.vsAI ? "Computer" : users[game.users[1]]?.nickname;
  const dispatch = useAppDispatch();

  return (
    <div className="h-[50px] flex flex-shrink-0 bg-beeYellow-900 dark:bg-beeYellow-900 text-beeYellow-200 text-lg px-4">
      <div className="flex items-center justify-start flex-auto">
        <span className="text-p1 font-bold">{p1Nick || "Player 2"}</span>
        <span className="mx-2"> vs </span>
        <span className="text-p2 font-bold">
          {p2Nick || "Player 1"}
          {game.vsAI && (
            <span className="font-normal opacity-50 no-underline ml-1">
              ({game.difficulty})
            </span>
          )}
        </span>
      </div>
      <div className="lg:w-[200px] flex items-center justify-end">
        {!game.gameOver && (
          <MenuTrigger>
            <Button className="p-2">
              <FontAwesomeIcon icon={faEllipsisV} />
            </Button>
            <Popover>
              <Menu>
                <MenuItem onAction={() => dispatch(forfeitGame(game.id))}>Resign</MenuItem>
                <MenuItem onAction={() => copy(getGameUrl(game.id))}>Copy spectate link</MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
        )}
      </div>
    </div>
  );
};

export default GameHeader;
