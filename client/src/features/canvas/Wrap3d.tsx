import { Stats, useProgress } from "@react-three/drei";
import { Object3DNode, useThree } from "@react-three/fiber";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Box3, Color, Group, PerspectiveCamera } from "three";
import type { ThreeElements } from '@react-three/fiber'

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { extend } from '@react-three/fiber'

// Add types to ThreeElements elements so primitives pick up on it
declare module '@react-three/fiber' {
  interface ThreeElements {
    customElement: Object3DNode<TextGeometry, typeof TextGeometry>
  }
}

const setZoom = (
  group: Group,
  width: number,
  height: number,
  boundingBox: Box3,
  camera: PerspectiveCamera
) => {
  boundingBox.setFromObject(group);
  const wzoom = width / (boundingBox.max.x - boundingBox.min.x);
  const hzoom = height / (boundingBox.max.y - boundingBox.min.y);
  const zoom = Math.min(wzoom, hzoom);
  const dpr = Math.max(window.devicePixelRatio, 2);
  camera.zoom = Math.min(zoom - 1, 25 * dpr);
  camera.updateProjectionMatrix();
};

const Wrap3d = ({ children }: { children: ReactNode }) => {
  extend({ TextGeometry })
  const { progress } = useProgress();

  const groupRef = useRef<Group>();
  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const [boundingBox] = useState(() => new Box3());

  useEffect(() => {
    if (progress === 100 && groupRef.current) {
      setTimeout(() => {
        if (groupRef.current) {
          setZoom(groupRef.current, width, height, boundingBox, camera);
        }
      }, 10);
    }
  }, [progress, width, height, groupRef, boundingBox, camera]);
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
