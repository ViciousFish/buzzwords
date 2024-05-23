import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import Modal from "../../presentational/Modal";
import Canvas from "../canvas/Canvas";
import HexWord from "../thereed-lettering/HexWord";

export type GameStateModalType =
  | "extra-turn-p1"
  | "extra-turn-p2"
  | "victory"
  | "defeat";

export interface GameStateModalProps {
  type: GameStateModalType;
}

interface GameStateModalOwnprops extends GameStateModalProps {
  onDismiss: () => void;
}

const getThreeDText = (type: GameStateModalOwnprops["type"]) => {
  if (type === "victory") {
    return "VICTORY";
  }
  if (type === "defeat") {
    return "DEFEAT";
  }
  if (type.startsWith("extra-turn")) {
    return "EXTRA TURN";
  }
  return null;
};

const getTwoDText = (
  type: GameStateModalProps["type"],
  p1Nick: string,
  p2Nick: string
) => {
  if (type === "extra-turn-p1" || type === "extra-turn-p2") {
    const thisPlayer = type === "extra-turn-p1" ? p1Nick : p2Nick;
    const otherPlayer = type === "extra-turn-p1" ? p2Nick : p1Nick;
    return {
      // title: "Extra turn",
      body: `${thisPlayer} captured ${otherPlayer}'s flower and gets an extra turn`,
    };
  }
  if (type === "defeat") {
    return {
      body: "Better luck next time",
    };
  }
  if (type === "victory") {
    return {
      body: "Congratulations!",
    };
  }
  return null;
};

const GameStateModal: React.FC<GameStateModalOwnprops> = ({
  type,
  onDismiss,
}) => {
  const selectedGameId = useAppSelector((state) => state.game.currentGame);
  const game = useAppSelector((state) =>
    selectedGameId ? state.gamelist.games[selectedGameId] : null
  );
  const opponents = useAppSelector((state) => state.user.opponents);

  const p1Nick = (game && opponents[game.users[0]]?.nickname) ?? "Pink";
  const p2Nick = (game && opponents[game.users[1]]?.nickname) ?? "Green";

  const threeDText = getThreeDText(type);
  const twoDText = getTwoDText(type, p1Nick, p2Nick);
  return (
    <Modal key={type} overlayClassName="flex">
      <div className="bg-lightbg rounded-xl w-[700px] h-[300px] flex justify-center items-center flex-col">
        {threeDText && (
          <div className="w-full max-w-[90vw] no-touch">
            <React.Suspense fallback={null}>
              <Canvas>
                <HexWord text={threeDText} />
              </Canvas>
            </React.Suspense>
          </div>
        )}
        {twoDText && (
          <div className="w-full max-w-[90vw] text-lg my-2 text-center text-text">
            <p>{twoDText.body}</p>
          </div>
        )}
        <div className="flex items-center">
          <Button onClick={onDismiss}>Dismiss</Button>
          {(type === "defeat" || type === "victory") && (
                <NavLink
                  to="/play/"
                  className="bg-primary ml-2 inset-shadow text-text p-2 rounded-full"
                >
                  New Game
                </NavLink>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GameStateModal;
