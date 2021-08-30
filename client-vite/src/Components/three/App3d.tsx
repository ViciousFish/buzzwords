import { Html, Stats, useProgress } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { Box3, Color, Group, PerspectiveCamera } from "three";
import { Buzz } from "./Buzz";
import HexWord from "./HexWord";

const setZoom = (
  group: Group,
  width: number,
  height: number,
  boundingBox: Box3,
  camera: PerspectiveCamera
) => {
  boundingBox.setFromObject(group);
  // console.log('dist', dist);
  const wzoom = width / (boundingBox.max.x - boundingBox.min.x);
  const hzoom = height / (boundingBox.max.y - boundingBox.min.y);
  const zoom = Math.min(wzoom, hzoom);
  const dpr = Math.max(window.devicePixelRatio, 2);
  const magicConstant = 24 / dpr;
  // magic adjustment numbers!
  // camera.zoom = zoom / magicConstant - 0;
  camera.zoom = Math.min(zoom - 2, 25 * dpr);
  camera.updateProjectionMatrix();
};

const App3d = () => {
  const { progress } = useProgress();

  const groupRef = useRef<Group>();
  const { width, height } = useThree((state) => state.size);
  const set = useThree(({ set }) => set);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const [boundingBox] = useState(() => new Box3());

  useEffect(() => {
    if (progress === 100 && groupRef.current) {
      setZoom(groupRef.current, width, height, boundingBox, camera);
    }
  }, [progress, width, height, groupRef, boundingBox, camera]);
  return (
    <group ref={groupRef}>
      <group position={[0, 0, 0]}>
        {progress === 100 && <Buzz position={[0, 6, 0]} />}
        {!import.meta.env.PROD && <Stats />}
        <ambientLight />
        <directionalLight position={[10, 10, 10]} />
        {!import.meta.env.PROD && (
          <box3Helper args={[boundingBox, new Color(0xff0000)]} />
        )}
        <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
          <group position={[0, 4, 0]}>
            <HexWord position={[0, -4.8, 0]} text="COMING" />
            <HexWord position={[0, -9.6, 0]} text="SOON!" />
          </group>
        </React.Suspense>
      </group>
    </group>
  );
};

export default App3d;
