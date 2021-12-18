import React, { useRef } from "react";
import { MeshProps, useLoader } from "@react-three/fiber";
import { theme } from "../app/theme";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import { Mesh } from "three";
import hextile from "../../assets/hextile.glb?url";

interface HexTileProps {
  orientation?: 'flat' | 'pointy'
  color?: 'primary' | 'p1' | 'p2'
}

const HexTile: React.FC<MeshProps & HexTileProps> = ({ position, rotation, orientation, color, ...props }) => {
  const group = useRef();
  // @ts-ignore
  const { nodes, materials } = useGLTF(hextile);
  // https://github.com/pmndrs/@react-three/fiber/blob/master/markdown/api.md#objects-properties-and-constructor-arguments
  // we might not need dispose=null?
  // https://gracious-keller-98ef35.netlify.app/docs/api/automatic-disposal/
  // I think it just keeps the mesh around
  return (
    <group
      ref={group}
      scale={[3, 3, 3]}
      dispose={null}
      position={position}
      rotation={rotation}
    >
      <mesh
        rotation={[Math.PI / 2, orientation === 'flat' ? Math.PI / 2 : 0, 0]}
        visible
        geometry={(nodes.Circle as Mesh).geometry}
        {...props}
      >
        <meshStandardMaterial
          // ToneMapped={false}
          color={theme.colors[color || 'primary']}
        />
      </mesh>
    </group>
  );
};

export default HexTile;
useGLTF.preload(hextile);
