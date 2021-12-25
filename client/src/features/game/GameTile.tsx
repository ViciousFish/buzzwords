import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { Group, Mesh, Vector3 } from "three";
import {
  ThreeEvent,
  useFrame,
  useLoader,
  Vector3 as V3Type,
} from "@react-three/fiber";
import { FontLoader } from "three";
import { useSpring, animated as a } from "@react-spring/three";
import { config as springConfig } from "@react-spring/core";

import HexTile from "../../assets/HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../app/theme";
import { usePrevious } from "../../utils/usePrevious";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { QRCoord } from "../hexGrid/hexGrid";
import { toggleTileSelected } from "./gameActions";
import { GamePlayer } from "./game";
import { Flower01 } from "../../assets/Flower01";
import { getOrderedTileSelectionCoords } from "./gameSelectors";
import { Sakura } from "../../assets/Sakura";
import { HexOutlineSolid } from "../../assets/Hexoutlinesolid";

// import { willConnectToTerritory } from "../../../../shared/gridHelpers";
interface GameTileProps {
  position: V3Type;
  letter?: string | null;
  coord?: QRCoord;
  owner: GamePlayer;
  currentGame: string;
  userIndex?: number;
  isCapital?: boolean;
  isPlayerIdentity?: boolean;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const GameTile: React.FC<GameTileProps> = ({
  letter,
  coord,
  position,
  owner,
  currentGame,
  userIndex,
  isCapital,
  isPlayerIdentity,
}) => {
  const dispatch = useAppDispatch();
  const font = useLoader(FontLoader, fredokaone);
  const fontConfig = useMemo(
    () => ({
      font,
      size: 2.5,
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

  const isSelected = useAppSelector((state) =>
    coord ? state.game.selectedTiles[coord] : null
  );
  const currentTurn = useAppSelector(
    (state) => state.gamelist.games[currentGame].turn
  );
  const currentMove = useAppSelector(getOrderedTileSelectionCoords);
  const grid = useAppSelector((state) =>
    currentGame ? state.gamelist.games[currentGame].grid : null
  );
  let color = theme.colors.primary;
  if (owner === 0) {
    color = theme.colors.p1;
  } else if (owner === 1) {
    color = theme.colors.p2;
  } else if (isSelected && grid && coord) {
    // const willConnect = willConnectToTerritory(
    //   grid,
    //   currentMove,
    //   coord,
    //   currentTurn
    // );
    color = currentTurn === 0 ? theme.colors.p1 : theme.colors.p2;
    // take color of current player and blend with base color?
  }

  let scale = owner !== 2 || isSelected ? 1 : 0.9;

  if (isPlayerIdentity && currentTurn === owner) {
    scale = 1;
  }

  // const hexRef = useRef();
  // const selectionRef = isPlayerIdentity && currentTurn === owner ? hexRef : {current: null};

  const colorAndScaleSpring = useSpring({
    scale: [scale, scale, scale],
    color,
    config: springConfig.stiff,
  });

  const outline = isPlayerIdentity && currentTurn === owner;

  const outlineScaleSpring = useSpring({
    scale: outline ? [1, 1, 1] : [0, 0, 0],
  });

  const isAnimating = useRef(false);
  const characterMesh = useRef<Mesh>();
  const group = useRef<Group>();

  const [rotateSpring, rotateSpringApi] = useSpring(() => ({
    x: 0,
    y: 0,
    config: {
      tension: 40,
      friction: 10,
    },
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
  const prevCapital = usePrevious(isCapital);
  useLayoutEffect(() => {
    if (
      (letter?.length || isCapital) &&
      (prevLetter !== letter || isCapital !== prevCapital) &&
      coord
    ) {
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
      }, 150 + Number(coord.split(",")[0]) * 50 + Math.random() * 150);
    }
    if ((prevLetter?.length && !letter) || (prevCapital && !isCapital)) {
      rotateSpringApi.start({
        x: Math.PI * 2,
        y: 0,
      });
      isAnimating.current = true;
    }
  }, [letter, prevLetter, rotateSpringApi, isCapital, prevCapital, coord]);

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
      if (coord && letter && currentTurn === userIndex) {
        dispatch(toggleTileSelected(coord));
      }
      e.stopPropagation();
    },
    [coord, dispatch, letter, currentTurn, userIndex]
  );
  return (
    // @ts-ignore
    <a.group
      ref={group}
      position={position}
      onClick={onTileClick}
      {...colorAndScaleSpring}
    >
      {/* <Html>{coord}</Html> */}
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
      {(isCapital || (prevCapital && !letter) || isPlayerIdentity) &&
        {
          0: <Flower01 />,
          1: <Sakura />,
        }[owner]}
      <group position={[0, 0, -0.2]}>
        <HexTile orientation="flat">
          {/* @ts-ignore */}
          <a.meshStandardMaterial
            color={colorAndScaleSpring.color}
          />
        </HexTile>
      </group>
      {/* @ts-ignore */}
      <a.group {...outlineScaleSpring}>
        {/* <HexOutline /> */}
        <HexOutlineSolid>
          <a.meshStandardMaterial
            color={colorAndScaleSpring.color}
          />
        </HexOutlineSolid>
      </a.group>
    </a.group>
  );
};

export default GameTile;
