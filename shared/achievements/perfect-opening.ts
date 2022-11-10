import { Achievement, AchievementImplementation } from ".";

export const APerfectOpeningMeta: Achievement = {
  id: 'perfect-opening',
  title: 'Perfect Opening',
  description: 'Use all 6 tiles neighboring your flower tile on your opening move',
  emoji: '💯'
}

export const APerfectOpeningImpl: AchievementImplementation = {
  id: 'perfect-opening',
  detector: (game, move) => {
    return true;
  }
}