import React, { useMemo, useRef, useLayoutEffect, useState } from "react";
import { Vector3 } from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { FontLoader } from "three";
import { useSpring, a } from "@react-spring/three";
import { useDrag, useGesture } from "@use-gesture/react";

import HexTile from "./HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../theme";

interface HexLetterProps {
  position: Vector3 | undefined;
  letter: string;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const HexLetter: React.FC<HexLetterProps> = ({ letter, ...props }) => {
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width


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

  const mesh = useRef();

  useLayoutEffect(() => {
    const size = new Vector3();
    if (mesh.current) {
      mesh.current.geometry.computeBoundingBox();
      mesh.current.geometry.boundingBox.getSize(size);
      // Mesh.current.position.x = hAlign === 'center' ? -size.x / 2 : hAlign === 'right' ? 0 : -size.x;
      mesh.current.position.x = -size.x / 2;
      // Mesh.current.position.y = vAlign === 'center' ? -size.y / 2 : vAlign === 'top' ? 0 : -size.y;
      mesh.current.position.y = -size.y / 2;
    }
  }, [letter]);

  const [spring, api] = useSpring(() => ({ rotation: [0, 0, 0], config: {tension: 100, friction: 20, damping: 20} }))
  const bind = useGesture({
    onDrag: ({down, movement: [mx, my] }) => api.start({
      rotation: [down ? (my / (aspect * 20)) : 0, down ? (mx / (aspect * 20)) : 0, 0]
    })
  })
  return (
    <a.group {...props} {...spring}>
      <a.mesh ref={mesh} {...bind()}>
        <textGeometry args={[letter, config]} />
        {/* <meshNormalMaterial */}
        <meshStandardMaterial
          // ToneMapped={false}
          color={theme.colors.darkbrown}
        />
      </a.mesh>
      <HexTile {...bind()} />
    </a.group>
  );
};

export default HexLetter;
