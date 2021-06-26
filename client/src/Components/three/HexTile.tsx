/* Notes
Rounded polygon math: https://www.stkent.com/2018/04/06/really-rounded-polygons.html
Perhaps make a "polygonal prism" component/class?
*/
import React, { useRef, useState, useMemo } from 'react';
import { MeshProps, useFrame, useLoader } from 'react-three-fiber';
import { Mesh, Shape } from 'three';
import { theme } from '../../theme';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGLTF } from '@react-three/drei';
// import hex from '../../assets/hextile.glb';


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
    // https://www.redblobgames.com/grids/hexagons/ render code at beginning

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
    const ninetyDeg = 90 * (Math.PI / 180);

    const shape = new Shape();
    // move to starting position (x = 0, y = radius in hexagon case)
    const startPoint = {
      x: origin.x + radius * Math.cos(ninetyDeg),
      y: origin.x + radius * Math.sin(ninetyDeg)
    };
    shape.moveTo(startPoint.x, startPoint.y);
    console.log('startPoint', startPoint);
    for (let i = 1; i <= vertices; i++) {
      const nextPoint = {
        x: origin.x + radius * Math.cos(ninetyDeg - (a * i)),
        y: origin.y + radius * Math.sin(ninetyDeg - (a * i))
      };
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
  const { nodes, materials } = useLoader(GLTFLoader, './assets/hextile.glb');
  // const { nodes, materials } = useGLTF('./assets/hextile.glb', '/draco-gltf/');

  return (
    // <mesh
    //   {...meshProps}
    //   ref={mesh}
    //   // scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
    //   // scale={[1, 1, 1]}
    //   // rotation={new Euler(0, 0, 90 * (Math.PI / 180))}
    //   onClick={(event) => setActive(!active)}
    //   onPointerOver={(event) => setHover(true)}
    //   onPointerOut={(event) => setHover(false)}>
    // https://github.com/pmndrs/react-three-fiber/blob/master/markdown/api.md#objects-properties-and-constructor-arguments
    <mesh
      rotation={[Math.PI / 2, 0, 0]}
      scale={[3, 3, 3]}
      visible
      geometry={(nodes.Circle as Mesh).geometry}
    >
      {/* <primitive object={hextile.nodes.Circle} /> */}
      {/* <extrudeBufferGeometry
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
      /> */}
      <meshBasicMaterial
        toneMapped={false}
        color={hovered ? theme.colors.darkbrown : theme.colors.primary}
      />
    </mesh>
  );
};

export default Polygon;