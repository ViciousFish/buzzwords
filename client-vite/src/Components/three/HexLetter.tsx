import React, { useMemo, useRef, useLayoutEffect } from "react";
import { Group, Mesh, Quaternion, Vector3 } from "three";
import {
  useFrame,
  useLoader,
  useThree,
  Vector3 as V3Type,
} from "@react-three/fiber";
import { FontLoader } from "three";
import { useSpring } from "@react-spring/three";
import { config as springConfig } from "@react-spring/core";
import { useGesture } from "@use-gesture/react";

import HexTile from "./HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../theme";

interface HexLetterProps {
  position: V3Type;
  letter: string;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const HexLetter: React.FC<HexLetterProps> = ({ letter, ...props }) => {
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  const font = useLoader(FontLoader, fredokaone);
  const config = useMemo(
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

  const mesh = useRef<Mesh>();
  const group = useRef<Group>();

  useLayoutEffect(() => {
    const size = new Vector3();
    if (mesh.current) {
      mesh.current.geometry.computeBoundingBox();
      mesh.current.geometry.boundingBox?.getSize(size);
      mesh.current.position.x = -size.x / 2;
      mesh.current.position.y = -size.y / 2;
    }
  }, [letter]);

  const [spring, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: springConfig.stiff,
  }));
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my] }) => {
      api.start({
        x: down ? my / (aspect * 3) : 0,
        y: down ? mx / (aspect * 3) : 0,
      });
    },
  });
  useFrame(() => {
    if (group.current) {
      const q = new Quaternion(Math.tan(spring.x.get()), Math.tan(spring.y.get()), 0, Math.PI / 2);
      q.normalize();
      group.current.setRotationFromQuaternion(q);
    }
  });
  return (
    <group ref={group} {...props}>
      {/* @ts-ignore */}
      <mesh ref={mesh} position={[0, 0, 0.2]} {...bind()}>
        <textGeometry args={[letter, config]} />
        <meshStandardMaterial color={theme.colors.darkbrown} />
      </mesh>
      {/* @ts-ignore */}
      <HexTile {...bind()} />
    </group>
  );
};

export default HexLetter;
