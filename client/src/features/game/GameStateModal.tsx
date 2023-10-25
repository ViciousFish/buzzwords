import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import Modal from "../../presentational/Modal";
import { NewButton } from "../../presentational/NewButton";
import Canvas from "../canvas/Canvas";
import HexWord from "../thereed-lettering/HexWord";
import { useNavigate } from "react-router";
import Crown from "../../assets/Crown";
import Bee from "../../assets/Bee";

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
  const navigate = useNavigate();
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
      <div style={{backgroundSize: '300% 250%', backgroundPositionY: '70%', backgroundPositionX: '40%'}} className="bg-vibrant-grad-beeYellow bg-gradient-to-bl bg-opacity-100 inset-shadow relative rounded-xl w-[700px] h-[400px] flex flex-col items-stretch p-4 overflow-hidden">
        {/* <div className="rounded-xl overflow-hidden absolute top-0 left-0 right-0 bottom-0 flex-auto flex flex-col p-0 items-stretch justify">
          <div className="flex-auto bg-beeYellow-100"></div>
          <div className="flex-auto bg-beeYellow-200"></div>
          <div className="flex-auto bg-beeYellow-300"></div>
          <div className="flex-auto bg-beeYellow-400"></div>
          <div className="flex-auto bg-beeYellow-500"></div>
          <div className="flex-auto bg-beeYellow-600"></div>
          <div className="flex-auto bg-beeYellow-700"></div>
          <div className="flex-auto bg-beeYellow-800"></div>
          <div className="flex-auto bg-beeYellow-900"></div>
        </div> */}
        <h1 style={{lineHeight: 1}} className="z-10 text-center text-[80px] p-0 text-beeYellow-900 font-fredoka">{threeDText}</h1>
        <div className="flex-auto bg-beeYellow-200 shadow-inner z-10 flex flex-col items-stretch rounded-md">
          <div className="flex-auto">
            {threeDText && (
              <div className="w-full max-w-[90vw] no-touch">
                <React.Suspense fallback={null}>
                  <Canvas>
                    {/* <HexWord text={threeDText} /> */}
                    <Crown position={[-1,1,1]} rotation={[0, Math.PI / 6, - Math.PI / 4]} />
                    <Bee position={[0,-1,0.5]} spinning={false}/>
                  </Canvas>
                </React.Suspense>
              </div>
            )}
          </div>
          <div className="flex-auto w-full max-w-[90vw] text-lg my-2 text-center text-text">
            {twoDText && <p>{twoDText.body}</p>}
          </div>
          <div className="flex justify-self-end items-center justify-end gap-2 p-4">
            <NewButton variant="springtime" onPress={onDismiss}>
              Dismiss
            </NewButton>
            {(type === "defeat" || type === "victory") && (
              <NewButton
                variant="springtime"
                onPress={() => navigate("/play/")}
              >
                New Game
              </NewButton>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GameStateModal;
