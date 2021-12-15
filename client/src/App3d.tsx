import { Html, Stats, useProgress } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Box3, Color, Group, PerspectiveCamera } from "three";
import { Bee } from "./Components/three/Bee";
import { Buzz } from "./Components/three/Buzz";
import HexWord from "./Components/three/HexWord";
import Home from "./features/home-route/Home";
import Play from "./features/play-route/Play";

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
        {!import.meta.env.PROD && <Stats />}
        <ambientLight />
        <directionalLight position={[10, 10, 10]} />
        {!import.meta.env.PROD && (
          <box3Helper args={[boundingBox, new Color(0xff0000)]} />
        )}
        <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="play" element={<Play />}>
                <Route index />
                <Route path="offline" />
                <Route path=":gameid" />
              </Route>
            </Routes>
          </BrowserRouter>
        </React.Suspense>
      </group>
    </group>
  );
};

export default App3d;
