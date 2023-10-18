import { Html, useProgress } from "@react-three/drei";
import React from "react";
import Canvas from "../canvas/Canvas";
import Bee from "../../assets/Bee";
import HexWord from "../thereed-lettering/HexWord";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// import { IconWatch01 } from "../../assets/IconWatch01";
import { NavLink, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { NewButton } from "../../presentational/NewButton";

const Home: React.FC = () => {
  const { progress } = useProgress();

  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-auto no-touch h-[50vh] pt-[20vh] p-12 ">
        <Canvas key="home">
          <React.Suspense
            fallback={
              <Html center>
                <FontAwesomeIcon
                  icon={faSpinner}
                  size="2x"
                  className="animate-spin m-4"
                />
              </Html>
            }
          >
            <Bee position={[0, 3, 0]} scale={1.7} />
            <group position={[0, -3, 0]}>
              <HexWord autoSpin position={[0, 0, 0]} text="WELCOME" />
            </group>
            <group position={[0, 0, 0]}></group>
          </React.Suspense>
        </Canvas>
      </div>
      <div className="flex justify-center items-center text-2xl flex-wrap">
        <NewButton
          onPress={() => navigate('/play/')}
          className="font-bold p-6 px-7"
          variant="green"
          thicker
        >
          Play Now
        </NewButton>
      </div>
    </>
  );
};

export default Home;
