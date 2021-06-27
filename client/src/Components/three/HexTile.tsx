import * as React from 'react';
import { useLoader } from 'react-three-fiber';
import { theme } from '../../theme';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mesh } from 'three';

const HexTile: React.FC = () => {
  const hovered = false;
  const { nodes, materials } = useLoader(GLTFLoader, './assets/hextile.glb');
  // https://github.com/pmndrs/react-three-fiber/blob/master/markdown/api.md#objects-properties-and-constructor-arguments
  return (
    <mesh
      rotation={[Math.PI / 2, 0, 0]}
      scale={[3, 3, 3]}
      visible
      geometry={(nodes.Circle as Mesh).geometry}
    >

      <meshStandardMaterial
        toneMapped={false}
        color={hovered ? theme.colors.darkbrown : theme.colors.primary}
      />
    </mesh>
  );
};

export default HexTile;
