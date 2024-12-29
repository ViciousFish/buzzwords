import React, { useState } from "react";
import {
  faEllipsisV,
  faPencil,
  faShareSquare,
  faTimes,
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
import { DialogTrigger, Button as AriaButton } from "react-aria-components";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { forfeitGame } from "../gamelist/gamelistActions";
import { NicknameForm } from "../settings/NicknameForm";
import { getAllUsers } from "../user/userSelectors";
import { getGameUrl } from "./PlayGame";
import NicknameModal from "../user/NicknameModal";
import { Modal2 } from "../../presentational/Modal2";
import { Dialog } from "../../presentational/Dialog";

interface GameHeaderProps {
  game: Game;
  userIndex: number | null;
}

const GameHeader: React.FC<GameHeaderProps> = ({ game, userIndex }) => {
  const users = useAppSelector(getAllUsers);
  const p1Nick = users[game.users[0]]?.nickname;
  const p2Nick = game.vsAI ? "Computer" : users[game.users[1]]?.nickname;
  const dispatch = useAppDispatch();

  const editButton =
    userIndex !== null ? (
      <DialogTrigger>
        <AriaButton
          className={`text-sm ${ userIndex === 0 ? 'text-p1' : 'text-p2'} p-1 mx-1 opacity-70 hover:opacity-100`}
          // colorClasses="text-pink-100 opacity-70 hover:opacity-100 border-0"
        >
          <FontAwesomeIcon icon={faPencil} />
        </AriaButton>
        <Modal2>
          <Dialog>
            <NicknameModal />
          </Dialog>
        </Modal2>
      </DialogTrigger>
    ) : null;

  return (
    <div className="h-[50px] flex flex-shrink-0 bg-beeYellow-900 dark:bg-beeYellow-900 text-beeYellow-200 text-lg px-4">
      <div className="flex items-center justify-start flex-auto">
        <span className="text-p1 font-bold">{p1Nick || "???"}</span>
        {p1Nick && userIndex === 0 && editButton}
        <span className="mx-2 text-textInverse"> vs </span>
        <span className="text-p2 font-bold">
          {p2Nick || "???"}
          {game.vsAI && (
            <span className="font-normal opacity-50 no-underline ml-1">
              ({game.difficulty})
            </span>
          )}
          {p2Nick && userIndex === 1 && editButton}
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
