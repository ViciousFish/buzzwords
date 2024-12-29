import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
} from "react";
import { Group, Mesh, Vector3 } from "three";
import {
  useFrame,
  useLoader,
  useThree,
  Vector3 as V3Type,
} from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { useSpring, animated as a, useTransition } from "@react-spring/three";
import { config as springConfig } from "@react-spring/core";

import HexTile from "../../assets/HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { usePrevious } from "../../utils/usePrevious";
import { useAppSelector } from "../../app/hooks";
import { QRCoord } from "../hexGrid/hexGrid";
import { GamePlayer } from "./game";
import { Flower01 } from "../../assets/Flower01";
import { Sakura } from "../../assets/Sakura";
import { HexOutlineSolid } from "../../assets/Hexoutlinesolid";
import Crown from "../../assets/Crown";
import { getTheme } from "../settings/settingsSelectors";

interface GameTileProps {
  coord?: QRCoord;
  currentTurn: 0 | 1;
  enableSelection: boolean;
  isCapital?: boolean;
  isPlayerIdentity?: boolean;
  hasCrown?: boolean;
  letter?: string | null;
  onSelect?: () => void;
  owner: GamePlayer;
  position: V3Type;
  selected: boolean;
  willBeReset: boolean;
  willBeCaptured: boolean;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const GameTile: React.FC<GameTileProps> = ({
  letter,
  coord,
  position,
  owner,
  currentTurn,
  enableSelection,
  hasCrown,
  onSelect,
  selected,
  willBeReset,
  willBeCaptured,
  isCapital,
  isPlayerIdentity,
}) => {
  const invalidate = useThree(({ invalidate }) => invalidate);

  const lowPowerMode = useAppSelector(({ settings }) => settings.lowPowerMode);

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

  const theme = useAppSelector(getTheme);

  let color = theme.colors.threed.primaryAccent;
  if (willBeReset && owner !== 2 && !selected) {
    color = theme.colors.threed.selected;
  } else if (owner === 0) {
    color = theme.colors.threed.p1;
  } else if (owner === 1) {
    color = theme.colors.threed.p2;
  } else if (selected && coord) {
    const turnColor =
      currentTurn === 0 ? theme.colors.threed.p1 : theme.colors.threed.p2;
    if (willBeCaptured) {
      color = turnColor;
    } else {
      color = theme.colors.threed.selected;
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
    onChange: () => {
      invalidate();
    },
    immediate: lowPowerMode,
  });

  const outline = isPlayerIdentity && currentTurn === owner;

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
    onChange: () => invalidate(),
    immediate: lowPowerMode,
  });

  const isAnimating = useRef(false);
  const characterMesh = useRef<Mesh>(null);
  const group = useRef<Group>(null);

  const [rotateSpring, rotateSpringApi] = useSpring(() => ({
    x: 0,
    y: 0,
    config: {
      tension: 40,
      friction: 10,
    },
    onChange: () => invalidate(),
    immediate: lowPowerMode,
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
      const [q, r] = coord.split(",");
      setTimeout(
        () => {
          const to = { x: 0, y: 0 };
          if (lowPowerMode) {
            rotateSpringApi.set(to);
          } else {
            rotateSpringApi.start(to);
          }
        },
        lowPowerMode
          ? 0
          : 100 + Number(r) * 80 + Number(q) * 80 + Math.random() * 70
      );
    }
    if ((prevLetter?.length && !letter) || (prevCapital && !isCapital)) {
      const to = {
        x: Math.PI * 2,
        y: 0,
      };
      if (lowPowerMode) {
        rotateSpringApi.set(to);
      } else {
        rotateSpringApi.start(to);
      }
      isAnimating.current = true;
    }
  }, [
    letter,
    prevLetter,
    rotateSpringApi,
    isCapital,
    prevCapital,
    coord,
    lowPowerMode,
  ]);

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

  return (
    // @ts-expect-error
    <a.group
      ref={group}
      position={position}
      onClick={
        enableSelection && letter && onSelect
          ? (e) => {
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
      {...colorAndScaleSpring}
    >
      {/* <Html>{coord}</Html> */}
      {letter && (
        <mesh ref={characterMesh} position={[0, 0, 0.2]}>
          <textGeometry args={[letter.toUpperCase(), fontConfig]} />
          <meshStandardMaterial color={theme.colors.threed.secondaryAccent} />
        </mesh>
      )}
      {prevLetter && !letter && (
        <mesh ref={characterMesh} position={[0, 0, 0.2]}>
          <textGeometry args={[prevLetter.toUpperCase(), fontConfig]} />
          <meshStandardMaterial color={theme.colors.threed.secondaryAccent} />
        </mesh>
      )}
      {(isCapital || (prevCapital && !letter) || isPlayerIdentity) &&
        {
          0: <Flower01 />,
          1: <Sakura />,
        }[owner]}
      <group position={[0, 0, -0.2]}>
        {hasCrown && (
          <Crown
            rotate
            scale={[2, 2, 2]}
            position={[-1.2, 2, 0]}
            rotation={[0, 0, Math.PI / 6]}
          />
        )}
        <HexTile orientation="flat">
          <a.meshStandardMaterial color={colorAndScaleSpring.color} />
        </HexTile>
      </group>
      {/* @ts-ignore */}
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
