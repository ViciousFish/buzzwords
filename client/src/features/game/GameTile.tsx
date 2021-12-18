import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
} from "react";
import { Group, Mesh, Vector3 } from "three";
import {
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

import HexTile from "../../Components/three/HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../theme";

interface GameTileProps {
  position: V3Type;
  letter: string | null;
  allowSpinning?: boolean;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const GameTile: React.FC<GameTileProps> = ({
  letter,
  allowSpinning,
  ...props
}) => {
  const viewport = useThree(({ viewport }) => viewport);
  const size = useThree(({ size }) => size);
  const aspect = size.width / viewport.getCurrentViewport().width;
  const isAnimating = useRef(false);

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

  const characterMesh = useRef<Mesh>();
  const group = useRef<Group>();

  const springRef = useSpringRef();
  const [rotateSpring, rotateSpringApi] = useSpring(() => ({
    x: 0,
    y: 0,
    config: springConfig.slow,
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
  useEffect(() => {
    if (allowSpinning) {
      let timer = Math.random() * 8000 + 2000;
      setTimeout(() => {
        isAnimating.current = true;
        rotateSpringApi.start({
          x: Math.PI * 2,
          y: 0,
        });
      }, timer);
      timer += Math.random() * 5000 + 200;
      setTimeout(() => {
        isAnimating.current = true;
        rotateSpringApi.start({
          x: 0,
          y: 0,
        });
      }, timer);
    }
  }, [rotateSpringApi, allowSpinning]);

  const [v] = useState(() => new Vector3());
  useFrame(() => {
    if (allowSpinning && group.current && isAnimating.current) {
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
    // @ts-ignore
    <a.group ref={group} {...props}>
      {/* @ts-ignore */}
      <mesh ref={characterMesh} position={[0, 0, 0.2]} >
        <textGeometry args={[letter, fontConfig]} />
        <meshStandardMaterial color={theme.colors.darkbrown} />
      </mesh>
      <group position={[0, 0, -0.2]}>
        {/* @ts-ignore */}
        <HexTile orientation="flat"/>
      </group>
    </a.group>
  );
};

export default GameTile;
