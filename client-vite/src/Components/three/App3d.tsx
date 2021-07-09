import { Html, Stats, useProgress } from "@react-three/drei";
import React, { useRef } from "react";
import { Group } from "three";
import useZoomToFit from "../../useZoomToFit";
import { Buzz } from "./Buzz";
import HexWord from "./HexWord";

const App3d = () => {
  const groupRef = useRef<Group>();
  const { progress } = useProgress();

  useZoomToFit(groupRef.current);
  return (
    <group ref={groupRef}>
      <Buzz position={[0, 6, 0]} />
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
