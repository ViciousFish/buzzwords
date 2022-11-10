import { Achievement } from "buzzwords-shared/achievements";
import React from "react";

interface AchievementTileProps {
  achievement: Achievement;
}

const AchievementTile: React.FC<AchievementTileProps> = ({ achievement }) => {
  return (
    <li className="w-[200px] h-[200px] flex flex-col bg-primary rounded text-text overflow-hidden">
      <div className="flex-auto flex flex-col gap-2 p-2 items-center justify-center">
        <span className="text-4xl">{achievement.emoji}</span>
        <span className="text-lg font-bold">{achievement.title}</span>
        <p className="text-sm text-textSubtle">{achievement.description}</p>
      </div>
      <div className="bg-green-600 text-white font-bold p-1 text-center">
        EARNED
      </div>
    </li>
  );
};

export default AchievementTile;
