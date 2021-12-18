import React from "react";
import { Html, useProgress } from "@react-three/drei";
import { Link, useParams } from "react-router-dom";

import Canvas from "../../Canvas";
import { Bee } from "../../Components/three/Bee";
import HexWord from "../../Components/three/HexWord";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

const Play: React.FC = () => {
  const { progress } = useProgress();
  const { id } = useParams();
  const game = useSelector((state: RootState) => state.gamelist.games[id]);
  return (
    <>
      <div>
        <Link className="btn" to="/">
          home
        </Link>
      </div>
      <div className="flex-auto lg:w-[calc(100vw-200px)]">
        <Canvas key={`play-${id}`}>
          <React.Suspense fallback={<Html center>{progress} % loaded</Html>}>
            <group>
              <HexWord text={id} />
            </group>
          </React.Suspense>
        </Canvas>
      </div>
    </>
  );
};

export default Play;
