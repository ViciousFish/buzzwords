import { Html, Stats, useProgress } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { Box3, Group, PerspectiveCamera } from "three";
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
  const zoom = Math.min(
    width / (boundingBox.max.x - boundingBox.min.x),
    height / (boundingBox.max.y - boundingBox.min.y)
  );
  // magic adjustment numbers!
  camera.zoom = zoom / 12 - 0;
  console.log(camera.zoom);
  camera.updateProjectionMatrix();
};

const App3d = () => {
  const { progress } = useProgress();

  const groupRef = useRef<Group>();
  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const [boundingBox] = useState(() => new Box3());

  useEffect(() => {
    if (groupRef.current) {
      console.log("yes");
      setZoom(groupRef.current, width, height, boundingBox, camera);
    } else {
      console.log("nope");
    }
  }, [width, height, groupRef.current]);

  useEffect(() => {
    if (progress === 100) {
      setZoom(groupRef.current, width, height, boundingBox, camera);
    }
    console.log(progress);
  }, [progress]);
  return (
    <group ref={groupRef}>
      {progress === 100 && <Buzz position={[0, 6, 0]} />}
      {!import.meta.env.PROD && <Stats />}
      {/* <CameraControls /> */}
      <ambientLight />
      <directionalLight position={[10, 10, 10]} />
      <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
        <group position={[0, 2, 0]}>
          <HexWord position={[0, -4.8, 0]} text="COMING" />
          <HexWord position={[0, -9.6, 0]} text="SOON!" />
        </group>
      </React.Suspense>
    </group>
  );
};

export default App3d;
