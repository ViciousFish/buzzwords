import React, { useRef } from "react";
import { GroupProps, useLoader } from "@react-three/fiber";
import { theme } from "../../theme";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import { Mesh } from "three";
import hextile from "../../../assets/hextile.glb?url";

const HexTile: React.FC<GroupProps> = (props) => {
  const group = useRef();
  // @ts-ignore
  const { nodes, materials } = useGLTF(hextile);
  // https://github.com/pmndrs/@react-three/fiber/blob/master/markdown/api.md#objects-properties-and-constructor-arguments
  // we might not need dispose=null?
  // https://gracious-keller-98ef35.netlify.app/docs/api/automatic-disposal/
  // I think it just keeps the mesh around
  return (
    <group ref={group} scale={[3, 3, 3]} {...props} dispose={null}>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        visible
        geometry={(nodes.Circle as Mesh).geometry}
      >
        <meshBasicMaterial
          // ToneMapped={false}
          color={theme.colors.primary}
        />
      </mesh>
    </group>
  );
};

export default HexTile;
useGLTF.preload(hextile);
