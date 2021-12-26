/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

import sakura from "../../assets/Sakura.glb?url";

export const Sakura = ({ ...props }) => {
  const group = useRef();
  // @ts-ignore
  const { nodes, materials } = useGLTF(sakura);
  return (
    <group ref={group} {...props} dispose={null}>
      <group
        rotation={[Math.PI / 2, Math.PI / 4, 0]}
        position={[0, 0, 1.2]}
        scale={[0.41, 0.41, 0.41]}
      >
        <mesh geometry={nodes.Sakura_1.geometry}>
          <meshStandardMaterial color="pink" />
        </mesh>
        <mesh geometry={nodes.Sakura_2.geometry} material={materials.Brown} />
      </group>
    </group>
  );
};

useGLTF.preload(sakura);