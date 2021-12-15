import React from "react";
import { Bee } from "../../Components/three/Bee";
import HexWord from "../../Components/three/HexWord";

const Home: React.FC = () => (
  <>
    <Bee position={[0, 5, 0]} scale={1.7} />
    <group position={[0, 4, 0]}>
      <HexWord position={[0, -4.8, 0]} text="COMING" />
      <HexWord position={[0, -9.6, 0]} text="SOON!" />
    </group>
  </>
);

export default Home;