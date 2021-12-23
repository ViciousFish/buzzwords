import { Html, useProgress } from "@react-three/drei";
import React from "react";
import Canvas from "../canvas/Canvas";
import { Bee } from "../../assets/Bee";
import HexWord from "../thereed-lettering/HexWord";

const Home: React.FC = () => {
  const { progress } = useProgress();
  return (
    <div className="flex flex-auto no-touch h-screen p-12">
      <Canvas key='home'>
        <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
          <Bee position={[0, 5, 0]} scale={1.7} />
          <group position={[0, 4, 0]}>
            <HexWord allowSpinning position={[0, -4.8, 0]} text="COMING" />
            <HexWord allowSpinning position={[0, -9.6, 0]} text="SOON!" />
          </group>
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Home;
