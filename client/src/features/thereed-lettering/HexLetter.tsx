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
import { useSpring, animated as a } from "@react-spring/three";
import { config as springConfig } from "@react-spring/core";
import { useGesture } from "@use-gesture/react";

import HexTile from "../../assets/HexTile";
import fredokaone from "../../../assets/Fredoka One_Regular.json?url";
import { theme } from "../../app/theme";

interface HexLetterProps {
  position: V3Type;
  letter: string;
  index?: number;
}

// Computing text positions: https://codesandbox.io/s/r3f-gltf-fonts-c671i?file=/src/Text.js:326-516

const HexLetter: React.FC<HexLetterProps> = ({ letter, index, ...props }) => {
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

  // const [config, setConfig] = React.useState('stiff' as keyof typeof springConfig);

  const mesh = useRef<Mesh>();
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
    if (mesh.current) {
      mesh.current.geometry.computeBoundingBox();
      mesh.current.geometry.boundingBox?.getSize(size);
      mesh.current.position.x = -size.x / 2;
      mesh.current.position.y = -size.y / 2;
    }
  }, [letter]);

  useEffect(() => {
    if (index !== undefined) {
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
        isAnimating.current = true;
      }, index * 80 + 300);
    }
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
  }, [rotateSpringApi, index]);

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my] }) => {
      isAnimating.current = true;
      if (down) {
        rotateSpringApi.set({
          x: mx / aspect,
          y: my / aspect,
        });
      } else {
        rotateSpringApi.start({
          x: 0,
          y: 0,
        });
      }
    },
  });
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
    // @ts-ignore
    <a.group ref={group} {...props}>
      {/* @ts-ignore */}
      <mesh ref={mesh} position={[0, 0, 0.2]} {...bind()}>
        <textGeometry args={[letter, fontConfig]} />
        <meshStandardMaterial color={theme.colors.darkbrown} />
      </mesh>
      <group position={[0, 0, -0.2]}>
        {/* @ts-ignore */}
        <HexTile orientation="pointy" {...bind()} />
      </group>
    </a.group>
  );
};

export default HexLetter;
