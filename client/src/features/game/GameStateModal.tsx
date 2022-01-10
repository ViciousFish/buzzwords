import React from "react";
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
  p1Nick: string;
  p2Nick: string;
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
  console.log('no 3d text')
  return null;
};

const getTwoDText = (type: GameStateModalProps["type"], p1Nick: string, p2Nick: string) => {
  if (type === "extra-turn-p1" || type === "extra-turn-p2") {
    const thisPlayer = type === 'extra-turn-p1' ? p1Nick : p2Nick
    const otherPlayer = type === 'extra-turn-p1' ? p2Nick : p1Nick
    return {
      title: "Extra turn",
      body: `${thisPlayer} captured ${p2Nick}'s flower and gets an extra turn`,
    };
  }
  console.log('no 2d text')
  return null;
};

const GameStateModal: React.FC<GameStateModalOwnprops> = ({
  type,
  p1Nick,
  p2Nick,
  onDismiss,
}) => {
  const threeDText = getThreeDText(type);
  const twoDText = getTwoDText(type, p1Nick, p2Nick);
  return (
    <Modal>
      <div className="bg-lightbg rounded-xl w-[600px] h-[250px] flex justify-center items-center flex-col">
        {threeDText && (
          <div className="w-full max-w-[90vw] no-touch">
            <Canvas>
              <HexWord text={threeDText} />
            </Canvas>
          </div>
        )}
        {twoDText && (
          <div className="w-full max-w-[90vw] text-center my-2">
            <h2 className="text-2xl">{twoDText.title}</h2>
            <p>{twoDText.body}</p>
          </div>
        )}
        <Button onClick={onDismiss}>Dismiss</Button>
      </div>
    </Modal>
  );
};

export default GameStateModal;
