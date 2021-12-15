import React from "react";
import Canvas from "../../Canvas";
import { Bee } from "../../Components/three/Bee";
import HexWord from "../../Components/three/HexWord";

const Home: React.FC = () => (
  <Canvas>
    <>
      <Bee position={[0, 5, 0]} scale={1.7} />
      <group position={[0, 4, 0]}>
        <HexWord position={[0, -4.8, 0]} text="COMING" />
        <HexWord position={[0, -9.6, 0]} text="SOON!" />
      </group>
    </>
  </Canvas>
);

export default Home;

{
  /* <React.Suspense fallback={<Html center>{progress} % loaded</Html>}> */
}

//   <Home />
// </React.Suspense>

{
  /* <Routes>
            <Route path="/" element={<Home />} />
            <Route path="play" element={<Play />}>
              <Route index />
              <Route path="offline" />
              <Route path=":gameid" />
            </Route>
          </Routes> */
}
