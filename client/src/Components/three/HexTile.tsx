/* Notes
Rounded polygon math: https://www.stkent.com/2018/04/06/really-rounded-polygons.html
Perhaps make a "polygonal prism" component/class?
*/
import React, { useRef, useState, useMemo } from 'react';
import { MeshProps, useFrame } from 'react-three-fiber';
import { Mesh, Shape } from 'three';
import { theme } from '../../theme';

interface HexTileOwnProps {
  radius: number;
  vertices: number;
}
const origin = {
  x: 0,
  y: 0
};

const Polygon: React.FC<HexTileOwnProps & MeshProps> = ({
  radius,
  vertices,
  ...meshProps
}) => {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>();

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const shape = useMemo(() => {
    // https://www.mathsisfun.com/geometry/interior-angles-polygons.html
    // https://stackoverflow.com/a/11354824/1776000
    // https://stackoverflow.com/a/3436464/1776000
    // https://eperezcosano.github.io/hex-grid/ (disagrees on math for calc of `a` - their way only works for hexagons)
    // their way:
    //   const interiorAngleSum = (vertices - 2) * 180;
    //   const angle = (interiorAngleSum / vertices) / 2;
    //         ^ divide by 2 because we're calculating triangles against the horizontal, not angles between each side
    //   const a = angle * (Math.PI / 180); // convert to radians
    const a = 2 * Math.PI / vertices;

    const shape = new Shape();
    // move to starting position (x = radius, y = 0)
    const startPoint = {
      x: origin.x + radius * Math.cos(0),
      y: origin.x + radius * Math.sin(0)
    };
    shape.moveTo(startPoint.x, startPoint.y);
    for (let i = 1; i <= vertices; i++) {
      const nextPoint = {
        x: origin.x + radius * Math.cos(a * i),
        y: origin.y + radius * Math.sin(a * i)
      };
      console.log('currentPoint', shape.currentPoint);
      console.log('nextPoint', nextPoint);
      shape.lineTo(nextPoint.x, nextPoint.y);
    }
    // shape.moveTo(...start);
    // paths.forEach((path) => shape.bezierCurveTo(...path));
    return shape;
  }, [radius, vertices]);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    // if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
  });

  return (
    <mesh
      {...meshProps}
      ref={mesh}
      // scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      // scale={[1, 1, 1]}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <extrudeBufferGeometry
        args={[
          shape,
          {
            steps: 1,
            depth: .5,
            bevelEnabled: false,
            // bevelThickness: .2,
            // bevelSize: .2,
            // bevelOffset: 0,
            // bevelSegments: 1
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

export default Polygon;