import React from 'react';

import HexGrid from '../../../../server/src/hexgrid';
import HexTile from './HexTile';

// interface GameBoardProps

export const GameBoard: React.FC = () => {
  const hg = React.useMemo(() => new HexGrid(), []);
  console.log(hg)
  // asdf
  return (
    <group>
      <HexTile />
    </group>
  )
}
