import { Html, useProgress } from "@react-three/drei";
import React, { useCallback } from "react";
import Canvas from "../canvas/Canvas";
import Bee from "../../assets/Bee";
import HexWord from "../thereed-lettering/HexWord";
import Button from "../../presentational/Button";
import { useAppDispatch } from "../../app/hooks";
import { createNewGame } from "../gamelist/gamelistActions";
import { useNavigate } from "react-router-dom";
import PlayVsAiButton from "./PlayVsAiButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faUser } from "@fortawesome/free-solid-svg-icons";

const Home: React.FC = () => {
  const { progress } = useProgress();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onPlayOnlineClick = useCallback(async () => {
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
              <HexWord autoSpin position={[0, 0, 0]} text="WELCOME" />
            </group>
            <group position={[0, 0, 0]}></group>
          </React.Suspense>
        </Canvas>
      </div>
      <div className="flex justify-center items-start">
        <Button
          className="p-4 text-2xl relative mt-[0vw]"
          onClick={onPlayOnlineClick}
          data-tip="You'll invite your opponent with a link"
        >
          <FontAwesomeIcon icon={faUser} />
          <span className="ml-2">Play vs human</span>
        </Button>
        <PlayVsAiButton mode="homepage" />
      </div>
    </>
  );
};

export default Home;
