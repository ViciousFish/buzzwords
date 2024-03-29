/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from "three";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import crown from "../../assets/Crown.glb?url";
import { useFrame } from "@react-three/fiber";
import { useAppSelector } from "../app/hooks";
import { getTheme } from "../features/settings/settingsSelectors";
import { Group } from "three";

type GLTFResult = GLTF & {
  nodes: {
    Crown_1: THREE.Mesh;
    Crown_2: THREE.Mesh;
  };
  materials: {
    Crown: THREE.MeshStandardMaterial;
    Red: THREE.MeshStandardMaterial;
  };
};

interface CrownExternalProps {
  rotate?: boolean;
}

type CrownProps = CrownExternalProps & JSX.IntrinsicElements["group"];

export default function Crown(props: CrownProps) {
  const theme = useAppSelector(getTheme);
  const group = useRef<THREE.Group>();
  const { nodes, materials } = useGLTF(crown) as unknown as GLTFResult;
  const ref = useRef<Group>();
  useFrame((state, delta) => {
    if (ref.current && ref.current.rotation && props.rotate) {
      // @ts-ignore types are just wrong here
      ref.current.rotation.y += delta * 1;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group scale={0.89} ref={ref}>
        <mesh geometry={nodes.Crown_1.geometry}>
          <meshStandardMaterial
            color={theme.colors.threed.crown}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        <mesh geometry={nodes.Crown_2.geometry}>
          <meshStandardMaterial
            color="#333333"
            roughness={0}
            metalness={0}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(crown);
