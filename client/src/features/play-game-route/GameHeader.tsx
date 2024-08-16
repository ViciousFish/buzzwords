import {
  faEllipsisV,
  faPencil,
  faShareSquare,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Game from "buzzwords-shared/Game";
import React, { useState } from "react";
import { DialogTrigger, Button as AriaButton } from "react-aria-components";
// import Modal from "../../presentational/Modal";
import { Popover } from "react-tiny-popover";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import CopyToClipboard from "../../presentational/CopyToClipboard";
import { forfeitGame } from "../gamelist/gamelistActions";
import { NicknameForm } from "../settings/NicknameForm";
import { getAllUsers } from "../user/userSelectors";
import { getGameUrl } from "./PlayGame";
import NicknameModal from "../user/NicknameModal";
import { Modal2 } from "../../presentational/Modal2";
import { Dialog } from "../../presentational/Dialog";

interface GameMenuProps {
  id: string;
}

const GameMenu = React.forwardRef<HTMLDivElement, GameMenuProps>(
  ({ id }, ref) => {
    const [resignState, setResignState] = useState<"unclicked" | "unconfirmed">(
      "unclicked"
    );
    const dispatch = useAppDispatch();

    return (
      <div
        ref={ref}
        className="bg-primary rounded-xl p-2 shadow-lg text-center text-text flex flex-col"
      >
        Game options
        {resignState === "unclicked" && (
          <Button
            onClick={(e) => {
              setResignState("unconfirmed");
              e.stopPropagation(); // not sure why I have to do this but it closes the overlay otherwise
            }}
            variant="dark"
            type="button"
          >
            Resign
          </Button>
        )}
        {resignState === "unconfirmed" && (
          <div className="rounded-xl pl-2 border border-p1">
            <span>Are you sure?</span>
            <Button
              onClick={() => {
                dispatch(forfeitGame(id));
                setResignState("unclicked");
              }}
              // variant="dark"
              className="bg-p1 font-bold"
              type="button"
            >
              RESIGN
            </Button>
          </div>
        )}
      </div>
    );
  }
);

GameMenu.displayName = "GameMenu";

interface GameHeaderProps {
  game: Game;
  userIndex: number | null;
}

const GameHeader: React.FC<GameHeaderProps> = ({ game, userIndex }) => {
  const [shareOverlay, setShareOverlay] = useState(false);
  const [menuOverlay, setMenuOverlay] = useState(false);

  const users = useAppSelector(getAllUsers);
  const p1Nick = users[game.users[0]]?.nickname;
  const p2Nick = game.vsAI ? "Computer" : users[game.users[1]]?.nickname;

  const shareOverlayContent = shareOverlay ? (
    <div className="bg-primary rounded-xl text-text p-4 shadow-lg border border-darkbrown max-w-[300px]">
      <button
        aria-label="dismiss spectator sharing prompt"
        className="float-right hover:opacity-75"
        onClick={() => setShareOverlay(false)}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <h3 className="text-lg font-bold">Spectating</h3>
      <p>Share this link with your friends to allow them to see your game.</p>
      <a
        className="underline text-textlink text-sm break-words block"
        href={getGameUrl(game.id)}
      >
        {getGameUrl(game.id)}
      </a>
      <CopyToClipboard label="Copy link" text={getGameUrl(game.id)} />
      {navigator.share && (
        <Button
          onClick={() =>
            navigator.share?.({
              url: getGameUrl(game.id),
            })
          }
          variant="dark"
        >
          Share <FontAwesomeIcon icon={faShareSquare} />
        </Button>
      )}
    </div>
  ) : (
    <></>
  );

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
    <div className="h-[50px] flex flex-shrink-0 bg-darkbrown text-textInverse text-lg px-4">
      <div className="flex items-center justify-start flex-auto">
        <span className="text-p1 font-bold">{p1Nick || "???"}</span>
        {p1Nick && userIndex === 0 && editButton}
        <span className="mx-2 text-textInverse"> vs </span>
        <span className="text-p2 font-bold">
          {p2Nick || "???"}
          {game.vsAI && (
            <span className="font-normal text-textInverse opacity-50 no-underline ml-1">
              ({game.difficulty})
            </span>
          )}
          {p2Nick && userIndex === 1 && editButton}
        </span>
      </div>
      <div className="lg:w-[200px] flex items-center justify-end">
        <Popover
          onClickOutside={() => setShareOverlay(false)}
          isOpen={shareOverlay}
          content={shareOverlayContent}
          containerClassName="z-30"
          positions={["bottom"]}
        >
          <button
            type="button"
            onClick={() => setShareOverlay(true)}
            className="mr-2"
          >
            <FontAwesomeIcon icon={faShareSquare} />
          </button>
        </Popover>
        {!game.gameOver && (
          <Popover
            isOpen={menuOverlay}
            onClickOutside={() => setMenuOverlay(false)}
            content={<GameMenu id={game.id} />}
            containerClassName="z-30"
            positions={["bottom"]}
          >
            <button
              type="button"
              onClick={() => setMenuOverlay(true)}
              className="px-2"
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default GameHeader;
