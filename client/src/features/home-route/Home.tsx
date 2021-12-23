import { Html, useProgress } from "@react-three/drei";
import React, { useCallback } from "react";
import Canvas from "../canvas/Canvas";
import { Bee } from "../../assets/Bee";
import HexWord from "../thereed-lettering/HexWord";
import Button from "../../presentational/Button";
import { useAppDispatch } from "../../app/hooks";
import { createNewGame } from "../gamelist/gamelistActions";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const { progress } = useProgress();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onPlayClick = useCallback(async () => {
    const game = await dispatch(createNewGame());
    navigate(`/play/${game}`);
  }, [navigate, dispatch])
  return (
    <div className="flex flex-auto no-touch h-screen p-12">
      <Canvas key='home'>
        <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
          <Bee position={[0, 5, 0]} scale={1.7} />
          <group position={[0, 4, 0]}>
            <HexWord position={[0, -4.8, 0]} text="BUZZWORDS" />
            <HexWord position={[0, -9.6, 0]} text="WELCOME!" />
          </group>
          <Html position={[0, -12, 0]} center><Button onClick={onPlayClick}>Play</Button></Html>
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Home;
