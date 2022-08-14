import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import * as R from "ramda";
import { Group, Mesh, Vector3 } from "three";
import {
  ThreeEvent,
  useFrame,
  useLoader,
  Vector3 as V3Type,
} from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { useSpring, animated as a, useTransition } from "@react-spring/three";
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
import {
  getHightlightedCoordsForCurrentReplayState,
  getTileSelectionInParsedHexCoords,
  getTilesThatWillBeResetFromCurrentPlay,
} from "./gameSelectors";
import { Sakura } from "../../assets/Sakura";
import { HexOutlineSolid } from "../../assets/Hexoutlinesolid";
import { isFullGame } from "../gamelist/gamelistSlice";
import { willConnectToTerritory } from "buzzwords-shared/gridHelpers";
import Crown from "../../assets/Crown";

interface GameTileProps {
  position: V3Type;
  letter?: string | null;
  coord?: QRCoord;
  owner: GamePlayer;
  currentGame: string;
  userIndex?: number;
  isCapital?: boolean;
  isPlayerIdentity?: boolean;
  gameOver: boolean;
  /** disable selection while submission in progress */
  isSubmitting?: boolean;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const GameTile: React.FC<GameTileProps> = ({
  letter: letterProp,
  coord,
  position,
  owner: ownerProp,
  currentGame,
  userIndex,
  isCapital: isCapitalProp,
  isPlayerIdentity,
  gameOver,
  isSubmitting,
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

  const game = useAppSelector((state) => state.gamelist.games[currentGame]);

  const isSelectedState = useAppSelector((state) =>
    coord ? state.game.selectedTiles[coord] : null
  );
  const currentTurn = game.turn;
  const currentMove = useAppSelector(getTileSelectionInParsedHexCoords);
  const gridState = isFullGame(game) ? game.grid : null;
  const replayMove = useAppSelector((state) => state.game.replay.move);
  const replayProgress = useAppSelector(
    (state) => state.game.replay.playbackState
  );
  const replayTiles = useAppSelector(
    getHightlightedCoordsForCurrentReplayState
  );

  const letter =
    replayMove && coord ? replayMove.grid[coord]?.value : letterProp;
  const owner =
    (replayMove && coord && replayMove.grid[coord].owner) ?? ownerProp;
  const isCapital =
    (replayMove && coord && replayMove.grid[coord].capital) ?? isCapitalProp;
  const selected =
    replayMove && coord ? Boolean(replayTiles[coord]) : isSelectedState;
  const turn = replayMove?.player ?? currentTurn;
  const grid = replayMove?.grid ?? gridState;

  const tilesThatWillBeReset = useAppSelector(
    (state) =>
      gridState &&
      getTilesThatWillBeResetFromCurrentPlay(state, gridState, currentTurn)
  );

  const willBeReset =
    tilesThatWillBeReset && coord && tilesThatWillBeReset[coord] && owner !== 2;

  let color = theme.colors.primary;
  if (willBeReset) {
    color = theme.colors.tile_selected;
  } else if (owner === 0) {
    color = theme.colors.tile_p1;
  } else if (owner === 1) {
    color = theme.colors.tile_p2;
  } else if (selected && grid && coord) {
    const [q, r] = coord.split(",");
    const parsedCoord = {
      q: Number(q),
      r: Number(r),
    };

    const willConnect = willConnectToTerritory(
      grid,
      replayMove ? R.take(replayProgress, replayMove.coords) : currentMove,
      parsedCoord,
      turn
    );
    const turnColor = turn === 0 ? theme.colors.tile_p1 : theme.colors.tile_p2;
    if (willConnect) {
      color = turnColor;
    } else {
      color = theme.colors.tile_selected;
    }
  }

  let scale = owner !== 2 || selected ? 1 : 0.9;

  if (isPlayerIdentity && currentTurn === owner) {
    scale = 1;
  }

  // const hexRef = useRef();
  // const selectionRef = isPlayerIdentity && currentTurn === owner ? hexRef : {current: null};

  const colorAndScaleSpring = useSpring({
    scale: [scale, scale, scale],
    color,
    config: {
      ...springConfig.stiff,
      clamp: true,
    },
  });

  const outline = game.gameOver
    ? false
    : isPlayerIdentity && currentTurn === owner;

  const crown = game.gameOver && isPlayerIdentity && game.winner === owner;

  const outlineTransition = useTransition(outline, {
    from: {
      scale: [0, 0, 0],
    },
    enter: {
      scale: [1, 1, 1],
    },
    leave: {
      scale: [0, 0, 0],
    },
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
      if (
        !gameOver &&
        coord &&
        letter &&
        currentTurn === userIndex &&
        !isSubmitting &&
        !replayMove
      ) {
        dispatch(toggleTileSelected(coord));
      }
      e.stopPropagation();
    },
    [
      coord,
      dispatch,
      letter,
      currentTurn,
      userIndex,
      gameOver,
      isSubmitting,
      replayMove,
    ]
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
          <textGeometry args={[letter.toUpperCase(), fontConfig]} />
          <meshStandardMaterial color={theme.colors.darkbrown} />
        </mesh>
      )}
      {prevLetter && !letter && (
        <mesh ref={characterMesh} position={[0, 0, 0.2]}>
          <textGeometry args={[prevLetter.toUpperCase(), fontConfig]} />
          <meshStandardMaterial color={theme.colors.darkbrown} />
        </mesh>
      )}
      {(isCapital || (prevCapital && !letter) || isPlayerIdentity) &&
        {
          0: <Flower01 />,
          1: <Sakura />,
        }[owner]}
      <group position={[0, 0, -0.2]}>
        {crown && (
          <Crown
            rotate
            scale={[2, 2, 2]}
            position={[-1.2, 2, 0]}
            rotation={[0, 0, Math.PI / 6]}
          />
        )}
        <HexTile orientation="flat">
          {/* @ts-ignore */}
          <a.meshStandardMaterial color={colorAndScaleSpring.color} />
        </HexTile>
      </group>
      {outlineTransition(
        (styles, item) =>
          item && (
            // @ts-ignore
            <a.group {...styles}>
              {/* <HexOutline /> */}
              <HexOutlineSolid>
                <a.meshStandardMaterial
                  toneMapped={false}
                  color={colorAndScaleSpring.color}
                />
              </HexOutlineSolid>
            </a.group>
          )
      )}
    </a.group>
  );
};

export default GameTile;
