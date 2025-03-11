import { Stats, useProgress } from "@react-three/drei";
import { Object3DNode, useThree } from "@react-three/fiber";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Box3, Group, PerspectiveCamera, Vector3 } from "three";

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { logtail } from "../../app/App";

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
): number => {
  if (height === 0 || height === 0) {
    console.error("zoom error: parameter out of bounds", {
      width,
      height,
      isGameboard,
    });
    return -1;
  }
  // if (isGameboard) {
  //   boundingBox.setFromPoints(GAMEBOARD_BOUNDING_POINTS);
  // } else {
    boundingBox.setFromObject(group);
  // }
  const wzoom = width / (boundingBox.max.x - boundingBox.min.x);
  const hzoom = height / (boundingBox.max.y - boundingBox.min.y);
  const zoom = Math.min(wzoom, hzoom);
  const dpr = Math.max(window.devicePixelRatio, 2);
  const appliedZoom = Math.min(
    isGameboard ? zoom : zoom - PAD_FACTOR,
    25 * dpr
  );
  if (appliedZoom < 0) {
    logtail.warn("zoom out of bounds", {
      path: window.location.pathname,
      appliedZoom,
      dpr,
      width,
      height,
      min: {x: boundingBox.min.x, y: boundingBox.min.y},
      max: {x: boundingBox.max.x, y: boundingBox.max.y},
    });
  } else {
    camera.zoom = appliedZoom;
    camera.updateProjectionMatrix();
  }
  return appliedZoom;
};

interface Wrap3dProps {
  children: ReactNode;
  isGameboard: boolean | undefined;
}

const Wrap3d = ({ children, isGameboard }: Wrap3dProps) => {
  const { progress } = useProgress();

  const groupRef = useRef<Group>(null);
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
          // if (zoom <= 0) {
          //   setTimeout(() => {
          //     if (groupRef.current) {
          //       console.log('zoom was out of bounds, running again')
          //       setZoom(
          //         groupRef.current,
          //         width,
          //         height,
          //         boundingBox,
          //         camera,
          //         isGameboard
          //       );
          //       invalidate();
          //     }
          //   }, 200);
          // }
        }
      });
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
