import React, { useRef, useState, useMemo } from 'react';
import { MeshProps, useFrame } from 'react-three-fiber';
import { Mesh, Vector2, Shape } from 'three';
import { theme } from '../../theme';

interface HexTileOwnProps {
  radius: number;
}

const HexTile: React.FC<HexTileOwnProps & MeshProps> = ({
  radius,
  ...meshProps
}) => {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>();

  const x = 0;
  const y = 0;

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const shape = useMemo(() => {
    var pts = [];
    pts.push(new Vector2(x+0, y+radius));
    pts.push(new Vector2(x+radius*0.866, y+radius*0.5));
    pts.push(new Vector2(x+radius*0.866, y-radius*0.5));
    pts.push(new Vector2(x+0, y-radius));
    pts.push(new Vector2(x-radius*0.866, y-radius*0.5));
    pts.push(new Vector2(x-radius*0.866, y+radius*0.5));
    const shape = new Shape(pts);
    // shape.moveTo(...start);
    // paths.forEach((path) => shape.bezierCurveTo(...path));
    return shape;
  }, [radius]);

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
      <extrudeGeometry
        args={[
          shape,
          {
            steps: 1,
            depth: .5,
            bevelEnabled: true,
            bevelThickness: .2,
            bevelSize: .2,
            bevelOffset: 0,
            bevelSegments: 10
          }
        ]}
      />
      {/* <boxBufferGeometry args={[2, 2, 2]} /> */}
      <meshBasicMaterial
        toneMapped={false}
        color={hovered ? theme.colors.darkbrown : theme.colors.primary}
      />
      {/* CQ: how to use array of materials for diff color face (as mentioned in extrude docs) */}
      {/* <meshBasicMaterial
        toneMapped={false}
        color='white'
      /> */}
    </mesh>
  );
};

export default HexTile;