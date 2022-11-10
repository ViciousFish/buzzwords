import React from "react";
import { ACHIEVEMENTS } from "buzzwords-shared/achievements";
import AchievementTile from "./AchievementTile";

const Achievements: React.FC = () => (
  <div className="p-4 md:p-6 mx-auto">
    <h1 className="text-2xl mb-4 font-bold text-text">Achievements</h1>
    <ul className="flex gap-2">
      {Object.values(ACHIEVEMENTS).map((ach) => (
        <AchievementTile key={ach.id} achievement={ach} />
      ))}
    </ul>
  </div>
);

export default Achievements;
