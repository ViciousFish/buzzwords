import React, { useRef, useState } from 'react';
import { Canvas, MeshProps, useFrame } from 'react-three-fiber';
import type { Mesh } from 'three';
import { theme } from '../../theme';

interface HexTileProps {
    diameter: number;
}

const HexTile: React.FC<HexTileProps & MeshProps> = ({
  diameter,
  ...meshProps
}) => {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>();

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
  });

  return (
    <mesh
      {...meshProps}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxBufferGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color={hovered ? theme.colors.darkbrown : theme.colors.primary} />
    </mesh>
  );
};

export default HexTile;