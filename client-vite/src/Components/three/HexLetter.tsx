import React, { useMemo, useRef, useLayoutEffect } from "react";
import { Group, Mesh, Quaternion, Vector3 } from "three";
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

import HexTile from "./HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../theme";

interface HexLetterProps {
  position: V3Type;
  letter: string;
  attachChain?: (springRef: SpringRef) => void;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const HexLetter: React.FC<HexLetterProps> = ({
  letter,
  attachChain,
  ...props
}) => {
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

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

  // const [config, setConfig] = React.useState('stiff' as keyof typeof springConfig);

  const mesh = useRef<Mesh>();
  const group = useRef<Group>();

  const springRef = useSpringRef();
  const [rotateSpring, rotateSpringApi] = useSpring(() => ({
    x: 0,
    y: 0,
    config: springConfig.stiff,
    ref: springRef,
  }));

  const [{ scale }] = useSpring(() => ({
    from: {
      scale: [0.5, 0.5, 0.5],
    },
    to: {
      scale: [1, 1, 1],
    },
    // CQ: do this based on grid coordinate
    delay: Math.random() * 500,
    config: springConfig.slow,
  }));

  if (attachChain) {
    attachChain(springRef);
  }

  useLayoutEffect(() => {
    const size = new Vector3();
    if (mesh.current) {
      mesh.current.geometry.computeBoundingBox();
      mesh.current.geometry.boundingBox?.getSize(size);
      mesh.current.position.x = -size.x / 2;
      mesh.current.position.y = -size.y / 2;
    }
  }, [letter]);

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my] }) => {
      rotateSpringApi.start({
        x: down ? mx / aspect : 0,
        y: down ? my / aspect : 0,
      });
    },
  });
  useFrame(() => {
    if (
      group.current &&
      (rotateSpring.x.isAnimating || rotateSpring.y.isAnimating)
    ) {
      const v = new Vector3(rotateSpring.y.get(), rotateSpring.x.get(), 0);
      const a = v.length();
      // let p = v.cross(new Vector3(0, 0, 1))
      v.normalize();
      group.current.setRotationFromAxisAngle(v, a / 7);
    }
  });
  return (
    // @ts-ignore
    <a.group ref={group} {...props} scale={scale}>
      {/* @ts-ignore */}
      <mesh ref={mesh} position={[0, 0, 0.2]} {...bind()}>
        <textGeometry args={[letter, fontConfig]} />
        <meshStandardMaterial color={theme.colors.darkbrown} />
      </mesh>
      <group position={[0, 0, -0.2]}>
        {/* @ts-ignore */}
        <HexTile {...bind()} />
      </group>
    </a.group>
  );
};

export default HexLetter;
