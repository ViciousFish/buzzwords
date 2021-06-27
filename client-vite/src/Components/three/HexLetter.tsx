import React, { useMemo, useRef, useLayoutEffect } from "react";
import { Group, Mesh, Vector3 } from "three";
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
    config: { tension: 100, friction: 20, damping: 20 },
  }));
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my] }) =>
      api.start({
        x: down ? my / (aspect * 2) : 0,
        y: down ? mx / (aspect * 2) : 0,
      }),
  });
  return (
    <a.group ref={group} {...props} rotation-y={spring.y.to(y => {
      const v = new Vector3(spring.x.get(), y, 0)
      if (group.current ) {
        return group.current.worldToLocal(v).y / 5
      }
    })} rotation-x={spring.x.to(x => {
      const v = new Vector3(x, spring.y.get(), 0)
      if (group.current ) {
        return group.current.worldToLocal(v).x / 5
      }
    })}>
      // @ts-ignore
      <a.group >
        {/* @ts-ignore */}
        <a.mesh ref={mesh} position={[0, 0, 0.2]} {...bind()}>
          <textGeometry args={[letter, config]} />
          <meshStandardMaterial color={theme.colors.darkbrown} />
        </a.mesh>
        {/* @ts-ignore */}
        <HexTile {...bind()} />
      </a.group>
    </a.group>
  );
};

export default HexLetter;
