import Game, { Move } from "../Game";
import { APerfectOpeningMeta } from "./perfect-opening";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export type AchievementDetector = (game: Game, move: Move) => boolean;

export interface AchievementImplementation {
  id: string;
  detector: AchievementDetector;
}

export const ACHIEVEMENTS = {
  'perfect-opening': APerfectOpeningMeta
}