import { Html, useProgress } from "@react-three/drei";
import React, { useCallback } from "react";
import Canvas from "../canvas/Canvas";
import Bee from "../../assets/Bee";
import HexWord from "../thereed-lettering/HexWord";
import Button from "../../presentational/Button";
import { useAppDispatch } from "../../app/hooks";
import { createNewGame } from "../gamelist/gamelistActions";
import { useNavigate } from "react-router-dom";
import { apiPrefix } from "../../app/apiPrefix";

const Home: React.FC = () => {
  const { progress } = useProgress();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onPlayClick = useCallback(async () => {
    const game = await dispatch(createNewGame());
    navigate(`/play/${game}`);
  }, [navigate, dispatch]);
  return (
    <>
      <div className="flex flex-auto no-touch h-1/2 mt-[20vh] p-12 ">
        <Canvas key="home">
          <React.Suspense
            fallback={<Html center>{progress.toFixed(0)} % loaded</Html>}
          >
            <Bee position={[0, 3, 0]} scale={1.7} />
            <group position={[0, -3, 0]}>
              <HexWord position={[0, 0, 0]} text="WELCOME" />
            </group>
            <group position={[0, 0, 0]}></group>
          </React.Suspense>
        </Canvas>
      </div>
      <div className="flex justify-center items-start">
        <Button
          className="p-4 text-2xl relative mt-[0vw]"
          onClick={onPlayClick}
        >
          Play
        </Button>
      </div>
    </>
  );
};

export default Home;
