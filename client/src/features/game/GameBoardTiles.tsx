import { GroupProps } from '@react-three/fiber';
import HexGrid from 'buzzwords-shared/hexgrid';
import React from 'react';
import { QRCoord } from '../hexGrid/hexGrid';
import GameTile from './GameTile';

export function GameBoardTiles({
  grid,
  revealLetters,
  submitting,
  currentGame,
  userIndex,
  position,
}: {
  grid: HexGrid;
  revealLetters: boolean;
  submitting: boolean;
  currentGame: string;
  userIndex: number;
} & Pick<GroupProps, "position">) {
  return (
    <group position={position}>
      {Object.entries(grid).map(([coord, tile]) => {
        return (
          <GameTile
            isSubmitting={submitting}
            isCapital={revealLetters ? tile.capital : false}
            coord={coord as QRCoord}
            letter={revealLetters ? tile.value : ""}
            position={[
              // https://www.redblobgames.com/grids/hexagons/#hex-to-pixel-axial
              3.1 * (3 / 2) * tile.q,
              -1 *
                3.1 *
                ((Math.sqrt(3) / 2) * tile.q + Math.sqrt(3) * tile.r),
              0,
            ]}
            key={coord}
            owner={tile.owner}
            currentGame={currentGame}
            userIndex={userIndex}
          />
        );
      })}
    </group>
  );
}
