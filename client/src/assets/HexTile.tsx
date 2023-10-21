import React, { useRef } from "react";
import { MeshProps } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";
import hextile from "../../assets/hextile.glb?url";
import { useAppSelector } from "../app/hooks";
import { getTheme } from "../features/settings/settingsSelectors";
import { path } from "ramda";

interface HexTileProps {
  orientation?: "flat" | "pointy";
  color?: string;
}

const HexTile: React.FC<MeshProps & HexTileProps> = ({
  position,
  rotation,
  orientation,
  color: _color,
  children,
  ...props
}) => {
  const theme = useAppSelector(getTheme);
  const color = path(_color?.split(".") ?? ["primaryAccent"], theme.colors.threed);
  console.log("🚀 ~ file: HexTile.tsx:25 ~ color:", color)
  const group = useRef(null);
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
        rotation={[Math.PI / 2, orientation === "flat" ? Math.PI / 2 : 0, 0]}
        visible
        geometry={(nodes.Circle as Mesh).geometry}
        {...props}
      >
        {!children && (
          <meshStandardMaterial color={color} />
        )}
        {children}
      </mesh>
    </group>
  );
};

export default HexTile;
useGLTF.preload(hextile);
