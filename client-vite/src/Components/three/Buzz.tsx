import React, { useMemo, useRef } from "react";
import { GroupProps, MeshProps, useFrame } from "@react-three/fiber";
import { Group, Shape } from "three";

const Wing: React.FC<MeshProps> = (props) => {
  const wingShape = useMemo(() => {
    const shape = new Shape();
    const circleRadius = 2;
    shape.moveTo(circleRadius, 0);
    shape.absarc(0, 0, circleRadius, 0, 2 * Math.PI, false);
    return shape;
  }, []);

  return (
    <mesh rotation={[Math.PI, 0, 0]} {...props}>
      <extrudeBufferGeometry
        args={[
          wingShape,
          {
            steps: 1,
            depth: 0.3,
            bevelEnabled: false,
            // BevelThickness: .2,
            // bevelSize: .2,
            // bevelOffset: 0,
            // bevelSegments: 1
          },
        ]}
      />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  );
};

export const Buzz: React.FC<GroupProps> = (props) => {
  const groupRef = useRef<Group>();
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -1 * clock.getElapsedTime();
    }
  });
  return (
    <group ref={groupRef}>
      <group rotation={[-1 * (Math.PI / 3), 0, 0]} {...props}>
        {/* head */}
        <mesh position={[0, 2.5, 0]}>
          <sphereBufferGeometry args={[1.7, 16, 16]} />
          <meshBasicMaterial color="#E0A40B" />
        </mesh>
        {/* body */}
        <mesh>
          <cylinderBufferGeometry args={[1.7, 1.7, 5, 16]} />
          <meshBasicMaterial color="#E0A40B" />
        </mesh>
        {/* stinger */}
        <mesh position={[0, -3.75, 0]} rotation={[Math.PI, 0, 0]}>
          <coneBufferGeometry args={[1.7, 2.5, 16]} />
          <meshBasicMaterial color="#59430D" />
        </mesh>
        {/* wings */}
        <Wing position={[2, 0, 2]} />
        <Wing position={[-2, 0, 2]} />
      </group>
    </group>
  );
};
