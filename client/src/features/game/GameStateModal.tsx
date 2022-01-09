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
  return null;
};

const getTwoDText = (type: GameStateModalProps["type"]) => {
  if (type === "extra-turn-p1" || type === "extra-turn-p2") {
    const thisPlayer = type === "extra-turn-p1" ? "Pink" : "Green";
    const otherPlayer = type === "extra-turn-p1" ? "Green" : "Pink";
    return {
      title: "Extra turn",
      body: `${thisPlayer} captured ${otherPlayer}'s flower and gets an extra turn`,
    };
  }
  return null;
};

const GameStateModal: React.FC<GameStateModalOwnprops> = ({
  type,
  onDismiss,
}) => {
  const threeDText = getThreeDText(type);
  const twoDText = getTwoDText(type);
  return (
    <Modal>
      <div className="bg-lightbg rounded-xl w-[800px] h-[250px] flex justify-center items-center flex-col">
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
