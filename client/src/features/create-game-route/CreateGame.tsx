import React from "react";
import Canvas from "../canvas/Canvas";
import BeeRobot from "../../assets/BeeRobot";
import { Sakura } from "../../assets/Sakura";

function GameTypeButton({ title, subtitle, onPress }) {
  return (
    <button className="flex flex-col justify-start items-start bg-primary p-8 rounded-xl shadow-lg">
      <span className="inline text-2xl font-bold">{title}</span>
      <span>{subtitle}</span>
    </button>
  );
}

function CreateGame() {
  return (
    <div className="h-full flex items-stretch">
      <div className="flex flex-col justify-center p-4 m-4 gap-8 rounded-xl lg:w-1/2">
        <h1 className="text-lg ml-8">Ready to rumble?</h1>
        <GameTypeButton title="Online against a human" subtitle="Requires an internet connection" />
        <GameTypeButton title="Online against a bot" subtitle="Requires an internet connection and logged in account" />
        <GameTypeButton title="Offline against a human" subtitle="Hotseat on this device" />
        <GameTypeButton title="Offline against a bot" />
      </div>
      <div>
        <Canvas>
          <Sakura/>
        </Canvas>
      </div>
    </div>
  );
}

export default CreateGame;
