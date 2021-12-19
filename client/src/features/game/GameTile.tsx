import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Group, Mesh, Vector3 } from "three";
import {
  GroupProps,
  ThreeEvent,
  useFrame,
  useLoader,
  useThree,
  Vector3 as V3Type,
} from "@react-three/fiber";
import { FontLoader } from "three";
import {
  SpringRef,
  useSpring,
  useSpringRef,
  animated as a,
} from "@react-spring/three";
import { config as springConfig } from "@react-spring/core";
import { useGesture } from "@use-gesture/react";

import HexTile from "../../assets/HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../app/theme";
import { Cell } from "../cell/cell";
import { usePrevious } from "../../utils/usePrevious";
import { useAppDispatch } from "../../app/hooks";
import { selectTile } from "./gameSlice";
import { QRCoord } from "../hexGrid/hexGrid";
import { toggleTileSelected } from "./gameActions";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Html } from "@react-three/drei";
import { GamePlayer } from "./game";

interface GameTileProps {
  position: V3Type;
  letter: string | null;
  coord: QRCoord;
  owner: GamePlayer;
  currentGame: string;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const GameTile: React.FC<GameTileProps> = ({
  letter,
  coord,
  position,
  owner,
  currentGame,
  // onClick,
}) => {
  const dispatch = useAppDispatch();
  const font = useLoader(FontLoader, fredokaone);
  const fontConfig = useMemo(
    () => ({
      font,
      size: 3,
      height: 1,
      curveSegments: 32,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 3,
    }),
    [font]
  );

  const isSelected = useSelector(
    (state: RootState) => state.game.selectedTiles[coord]
  );
  const currentTurn = useSelector(
    (state: RootState) => state.gamelist.games[currentGame].turn
  );
  let color = theme.colors.primary;
  if (owner === 0) {
    color = theme.colors.p1;
  } else if (owner === 1) {
    color = theme.colors.p2;
  } else if (isSelected) {
    color = currentTurn === 0 ? theme.colors.p1 : theme.colors.p2;
    // take color of current player and blend with base color?
  }

  const scale = owner !== 2 || isSelected ? 1 : 0.9;

  const colorAndScaleSpring = useSpring({
    scale: [scale, scale, scale],
    color,
    config: springConfig.stiff,
  });

  const isAnimating = useRef(false);
  const characterMesh = useRef<Mesh>();
  const group = useRef<Group>();

  const springRef = useSpringRef();
  const [rotateSpring, rotateSpringApi] = useSpring(() => ({
    x: 0,
    y: 0,
    config: springConfig.molasses,
    ref: springRef,
  }));

  useLayoutEffect(() => {
    const size = new Vector3();
    if (characterMesh.current) {
      characterMesh.current.geometry.computeBoundingBox();
      characterMesh.current.geometry.boundingBox?.getSize(size);
      characterMesh.current.position.x = -size.x / 2;
      characterMesh.current.position.y = -size.y / 2;
    }
  }, [letter]);

  // TODO: animate flip when letter or activated state changes
  const prevLetter = usePrevious(letter);
  useLayoutEffect(() => {
    if (letter?.length && prevLetter !== letter) {
      rotateSpringApi.set({
        x: Math.PI * 2,
        y: 0,
      });
      isAnimating.current = true;
      setTimeout(() => {
        rotateSpringApi.start({
          x: 0,
          y: 0,
        });
      }, Math.random() * 300 + 200);
    }
    if (prevLetter?.length && !letter) {
      rotateSpringApi.start({
        x: Math.PI * 2,
        y: 0,
      });
      isAnimating.current = true;
    }
  }, [letter, prevLetter, rotateSpringApi]);

  const [v] = useState(() => new Vector3());
  useFrame(() => {
    if (group.current && isAnimating.current) {
      v.set(rotateSpring.y.get(), rotateSpring.x.get(), 0);
      const a = v.length();
      v.normalize();
      group.current.setRotationFromAxisAngle(v, a / 2);
      if (a === 0) {
        isAnimating.current = false;
      }
    }
  });

  const onTileClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      dispatch(toggleTileSelected(coord));
      // e.stopImmediatePropagation();
      e.stopPropagation();
    },
    [coord, dispatch]
  );
  return (
    // @ts-ignore
    <a.group
      ref={group}
      position={position}
      onClick={onTileClick}
      {...colorAndScaleSpring}
    >
      {letter && (
        <mesh ref={characterMesh} position={[0, 0, 0.2]}>
          <textGeometry args={[letter, fontConfig]} />
          <meshStandardMaterial color={theme.colors.darkbrown} />
        </mesh>
      )}
      {prevLetter && !letter && (
        <mesh ref={characterMesh} position={[0, 0, 0.2]}>
          <textGeometry args={[prevLetter, fontConfig]} />
          <meshStandardMaterial color={theme.colors.darkbrown} />
        </mesh>
      )}
      <group position={[0, 0, -0.2]}>
        <HexTile orientation="flat">
          <a.meshStandardMaterial color={colorAndScaleSpring.color} />
        </HexTile>
      </group>
    </a.group>
  );
};

export default GameTile;
