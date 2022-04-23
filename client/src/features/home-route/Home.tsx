import { Html, useProgress } from "@react-three/drei";
import React from "react";
import Canvas from "../canvas/Canvas";
import Bee from "../../assets/Bee";
import HexWord from "../thereed-lettering/HexWord";
import PlayButtons from "./PlayButtons";

const Home: React.FC = () => {
  const { progress } = useProgress();
  
  return (
    <>
      <div className="flex flex-auto no-touch h-[50vh] mt-[20vh] p-12 ">
        <Canvas key="home">
          <React.Suspense
            fallback={<Html center>{progress.toFixed(0)} % loaded</Html>}
          >
            <Bee position={[0, 3, 0]} scale={1.7} />
            <group position={[0, -3, 0]}>
              <HexWord autoSpin position={[0, 0, 0]} text="WELCOME" />
            </group>
            <group position={[0, 0, 0]}></group>
          </React.Suspense>
        </Canvas>
      </div>
      <div className="flex justify-center items-start text-2xl">
        <PlayButtons mode="text" buttonClasses="p-4"/>
      </div>
    </>
  );
};

export default Home;
