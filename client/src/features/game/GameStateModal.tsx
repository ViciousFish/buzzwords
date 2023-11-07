import React, { ReactNode, StyleHTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import Modal from "../../presentational/Modal";
import { NewButton } from "../../presentational/NewButton";
import { Canvas } from "@react-three/fiber";
import HexWord from "../thereed-lettering/HexWord";
import { useNavigate } from "react-router";
import { Center, OrbitControls, Stage, Text3D } from "@react-three/drei";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import Crown from "../../assets/Crown";
import Bee from "../../assets/Bee";
import { getTheme } from "../settings/settingsSelectors";
import { useTrail, a } from "@react-spring/web";
import classNames from "classnames";

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

const ThreeDText = ({ threeDText, theme }) => (
  <div className="no-touch">
    <React.Suspense fallback={null}>
      <Canvas orthographic shadows>
        {/* <HexWord text={threeDText} /> */}
        {/* <Crown position={[-1,1,1]} rotation={[0, Math.PI / 6, - Math.PI / 4]} />
            <Bee position={[0,-1,0.5]} spinning={false}/> */}
        <Stage
          intensity={0.5}
          // preset="soft"
          preset={{
            main: [0, 3, -7],
            fill: [0, 2, -2],
          }}
          shadows={{
            type: "contact",
            // frames: 0
          }}
          // CQ: disable randomized light
          adjustCamera={1.4}
          // center={{
          //   left: true
          // }}
          environment="city"
        >
          {/* <Center> */}
          <Text3D castShadow size={1} font={fredokaone}>
            {threeDText}
            <meshStandardMaterial color={theme.colors.threed.beeBrown} />
          </Text3D>
          {/* </Center> */}
        </Stage>
        <OrbitControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.9}
          makeDefault
        />
      </Canvas>
    </React.Suspense>
  </div>
);

const Trail: React.FC<{ open: boolean; className: string; children: string; style: StyleHTMLAttributes }> =
  ({ open, children, className, style: _style }) => {
    const items = children.split("");
    const trail = useTrail(items.length, {
      config: { mass: 5, tension: 2000, friction: 200 },
      opacity: open ? 1 : 0,
      // x: open ? 0 : 20,
      // height: open ? 110 : 0,
      from: { opacity: 0 },
    });
    return trail.map((style, index) => (
      <a.div key={index} className={className} style={{..._style, ...style}}>
        {items[index]}
      </a.div>
    ));
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

  const theme = useAppSelector(getTheme);

  const p1Nick = (game && opponents[game.users[0]]?.nickname) ?? "Pink";
  const p2Nick = (game && opponents[game.users[1]]?.nickname) ?? "Green";

  const threeDText = getThreeDText(type);
  const twoDText = getTwoDText(type, p1Nick, p2Nick);
  return (
    <Modal key={type} overlayClassName="flex">
      <div
        style={{
          backgroundSize: "300% 250%",
          backgroundPositionY: "70%",
          backgroundPositionX: "40%",
        }}
        className={`bg-vibrant-grad-beeYellow bg-gradient-to-bl bg-opacity-100 
      inset-shadow relative rounded-xl w-[700px] h-[400px] flex flex-col p-2 overflow-hidden`}
      >
        <div className="flex justify-center gap-1">
          {threeDText && (
            <Trail
              className="text-[90px] drop-shadow font-fredoka text-darkbrown font-bold text-center"
              style={{
                lineHeight: 1
              }}
              open
            >
              {threeDText}
            </Trail>
          )}
        </div>
        {/* {threeDText && <ThreeDText threeDText={threeDText} theme={theme} />} */}
        <div className="flex-auto rounded-lg bg-beeYellow-200 flex flex-col p-2">
          <div className="flex-auto flex justify-center items-center">
            {twoDText?.body}
          </div>

          <div className="flex-shrink-0 flex justify-self-end items-center justify-end gap-2">
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
