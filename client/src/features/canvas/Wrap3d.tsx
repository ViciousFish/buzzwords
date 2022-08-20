import { Stats, useProgress } from "@react-three/drei";
import { Object3DNode, useThree } from "@react-three/fiber";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Box3, Color, Group, PerspectiveCamera, Vector3 } from "three";

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { extend } from "@react-three/fiber";

// Add types to ThreeElements elements so primitives pick up on it
declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
  }
}

const GAMEBOARD_BOUNDING_POINTS = [
  new Vector3(-17, 27, 0),
  new Vector3(17, 27, 0),
  new Vector3(0, -26, 0),
];

const PAD_FACTOR = 1;

const setZoom = (
  group: Group,
  width: number,
  height: number,
  boundingBox: Box3,
  camera: PerspectiveCamera,
  isGameboard: boolean | undefined
) => {
  if (isGameboard) {
    boundingBox.setFromPoints(GAMEBOARD_BOUNDING_POINTS);
  } else {
    boundingBox.setFromObject(group);
  }
  const wzoom = width / (boundingBox.max.x - boundingBox.min.x);
  const hzoom = height / (boundingBox.max.y - boundingBox.min.y);
  const zoom = Math.min(wzoom, hzoom);
  const dpr = Math.max(window.devicePixelRatio, 2);
  // CQ: TODO: scale pad by screen size? Or do that in CSS?
  camera.zoom = Math.min(isGameboard ? zoom : zoom - PAD_FACTOR, 25 * dpr);
  camera.updateProjectionMatrix();
};

interface Wrap3dProps {
  children: ReactNode;
  isGameboard: boolean | undefined;
}

const Wrap3d = ({ children, isGameboard }: Wrap3dProps) => {
  extend({ TextGeometry });
  const { progress } = useProgress();

  const groupRef = useRef<Group>();
  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const [boundingBox] = useState(() => new Box3());
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (progress === 100 && groupRef.current) {
      requestAnimationFrame(() => {
        if (groupRef.current) {
          setZoom(
            groupRef.current,
            width,
            height,
            boundingBox,
            camera,
            isGameboard
          );
          invalidate();
        }
      });
      setTimeout(() => {
        if (groupRef.current) {
          setZoom(
            groupRef.current,
            width,
            height,
            boundingBox,
            camera,
            isGameboard
          );
          invalidate();
        }
      }, 200);
    }
  }, [
    progress,
    width,
    height,
    groupRef,
    boundingBox,
    camera,
    isGameboard,
    invalidate,
  ]);
  return (
    // @ts-ignore
    <group ref={groupRef}>
      <group position={[0, 0, 0]}>
        {/* {!import.meta.env.PROD && <Stats />} */}
        <ambientLight />
        <directionalLight position={[10, 10, 10]} />
        {/* {!import.meta.env.PROD && (
          <box3Helper args={[boundingBox, new Color(0xff0000)]} />
        )} */}
        {children}
      </group>
    </group>
  );
};

export default Wrap3d;
