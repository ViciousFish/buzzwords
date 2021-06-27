import { Vector3, useLoader } from '@react-three/fiber';
import React, { useMemo } from 'react';
import { FontLoader } from 'three'
import HexTile from './HexTile';
import fredokaone from '../../../assets/Fredoka One_Regular.json?url'
import { theme } from '../../theme';

interface HexLetterProps {
  position: Vector3 | undefined;
  letter: string;
}

const HexLetter: React.FC<HexLetterProps> = ({
  letter,
  ...props
}) => {
  const font = useLoader(FontLoader, fredokaone)
  const config = useMemo(
    () => ({
      font,
      size: 3,
      height: 1,
      curveSegments: 32,
      bevelEnabled: true,
      bevelThickness: .1,
      bevelSize: .1,
      bevelOffset: 0,
      bevelSegments: 3
    }),
    [font]
  )
  return (
    <group {...props} >
      <mesh
        position={[-1.4,-1.5,0]}
      >
        <textGeometry
          args={[letter, config]}
        />
        {/* <meshNormalMaterial /> */}
        <meshStandardMaterial
          // toneMapped={false}
          color={theme.colors.darkbrown}
        />
      </mesh>
      <HexTile />
    </group>
  )
}

export default HexLetter;
