import React, { useMemo, useRef, useLayoutEffect } from "react";
import { Mesh, Vector3 } from "three";
import { useLoader, useThree, Vector3 as V3Type } from "@react-three/fiber";
import { FontLoader } from "three";
import { useSpring, a } from "@react-spring/three";
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
      height: .5,
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
    rotation: [0, 0, 0],
    config: { tension: 100, friction: 20, damping: 20 },
  }));
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my] }) =>
      api.start({
        rotation: [
          down ? my / (aspect * 2) : 0,
          down ? mx / (aspect * 2) : 0,
          0,
        ],
      }),
  });
  return (
    // @ts-ignore
    <a.group {...props} {...spring}>
      {/* @ts-ignore */}
      <a.mesh castShadow ref={mesh} position={[0, 0, .75]} {...bind()}>
        <textGeometry args={[letter, config]} />
        <meshStandardMaterial color={theme.colors.darkbrown} />
      </a.mesh>
      {/* @ts-ignore */}
      <HexTile {...bind()} />
    </a.group>
  );
};

export default HexLetter;
