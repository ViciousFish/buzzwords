import { A11y } from '@react-three/a11y';
import React from 'react';
import GameTile from './GameTile';

// test
const GameTileOuter: React.FC = () => {
  return (
    <A11y>
      <GameTile />
    </A11y>
  )
}